"""
Expiration date extraction using OCR
This module uses EasyOCR to read dates from food packaging
"""
import easyocr
import re
from datetime import datetime
from typing import Optional, List
import numpy as np


class DateExtractor:
    """Extract expiration dates from images using OCR"""

    def __init__(self, languages: List[str] = ['en']):
        """
        Initialize the OCR reader

        Args:
            languages: List of language codes for OCR (default: English)
        """
        try:
            self.reader = easyocr.Reader(languages, gpu=False)
            print(f"✅ Initialized EasyOCR with languages: {languages}")
        except Exception as e:
            print(f"❌ Error initializing EasyOCR: {e}")
            self.reader = None

    def extract_text(self, image) -> List[str]:
        """
        Extract all text from an image

        Args:
            image: Image as numpy array or file path

        Returns:
            List of detected text strings
        """
        if self.reader is None:
            return []

        try:
            # Run OCR
            results = self.reader.readtext(image)

            # Extract just the text (results are tuples of (bbox, text, confidence))
            texts = [result[1] for result in results if result[2] > 0.5]  # confidence > 0.5

            return texts

        except Exception as e:
            print(f"❌ Error during OCR: {e}")
            return []

    def find_expiration_date(self, texts: List[str]) -> Optional[datetime]:
        """
        Find and parse expiration date from OCR text

        Args:
            texts: List of text strings from OCR

        Returns:
            Parsed datetime object or None if no date found
        """
        # Common date patterns
        date_patterns = [
            # MM/DD/YYYY or MM-DD-YYYY
            r'(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})',
            # DD/MM/YYYY
            r'(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})',
            # YYYY-MM-DD
            r'(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})',
            # Month DD, YYYY (e.g., "JAN 15, 2025" or "Jan 15 2025")
            r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{4})',
            # DDMMMYY (e.g., "15JAN25")
            r'(\d{2})(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\d{2})',
        ]

        # Keywords that suggest expiration date
        exp_keywords = ['exp', 'best', 'use', 'sell', 'by']

        all_text = ' '.join(texts).lower()

        for pattern in date_patterns:
            matches = re.finditer(pattern, all_text, re.IGNORECASE)

            for match in matches:
                # Check if this match is near expiration keywords
                match_pos = match.start()
                nearby_text = all_text[max(0, match_pos - 20):match_pos + 20]

                # Prioritize matches near expiration keywords
                has_keyword = any(keyword in nearby_text for keyword in exp_keywords)

                try:
                    date_obj = self._parse_date_match(match, pattern)
                    if date_obj and date_obj > datetime.now():
                        return date_obj
                except:
                    continue

        return None

    def _parse_date_match(self, match, pattern: str) -> Optional[datetime]:
        """
        Parse a regex match into a datetime object

        Args:
            match: Regex match object
            pattern: The pattern that was matched

        Returns:
            Datetime object or None
        """
        groups = match.groups()

        try:
            # Handle different date formats
            if 'jan|feb|mar' in pattern.lower():
                # Month name format
                month_names = {
                    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
                    'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
                    'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
                }

                if len(groups) == 3:
                    if groups[0].lower()[:3] in month_names:
                        month = month_names[groups[0].lower()[:3]]
                        day = int(groups[1])
                        year = int(groups[2])
                    else:
                        day = int(groups[0])
                        month = month_names[groups[1].lower()[:3]]
                        year = int(groups[2])

                    # Handle 2-digit years
                    if year < 100:
                        year += 2000

                    return datetime(year, month, day)

            elif len(groups) == 3:
                # Numeric date format
                val1, val2, val3 = int(groups[0]), int(groups[1]), int(groups[2])

                # Determine which is year, month, day
                if val1 > 1000:  # YYYY-MM-DD
                    year, month, day = val1, val2, val3
                elif val3 > 1000:  # MM-DD-YYYY or DD-MM-YYYY
                    year = val3
                    # Assume MM/DD/YYYY (US format)
                    month, day = val1, val2
                else:  # 2-digit year
                    year = val3 + 2000 if val3 < 100 else val3
                    month, day = val1, val2

                # Validate ranges
                if 1 <= month <= 12 and 1 <= day <= 31:
                    return datetime(year, month, day)
                # Try swapping month and day (DD/MM format)
                elif 1 <= day <= 12 and 1 <= month <= 31:
                    return datetime(year, day, month)

        except (ValueError, IndexError) as e:
            return None

        return None

    def extract_date_from_image(self, image) -> Optional[str]:
        """
        Complete pipeline: OCR + date extraction

        Args:
            image: Image as numpy array or file path

        Returns:
            Date string in ISO format (YYYY-MM-DD) or None
        """
        texts = self.extract_text(image)

        if not texts:
            return None

        date_obj = self.find_expiration_date(texts)

        if date_obj:
            return date_obj.strftime("%Y-%m-%d")

        return None
