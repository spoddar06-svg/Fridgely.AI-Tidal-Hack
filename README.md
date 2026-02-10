<div align="center">

# 🥦 Fridgely AI

### Reduce food waste, save money, and cook smarter with AI

*Built for Hackathon 2026*

![Frigley AI Dashboard](screenshots/dashboard.png)

**[Watch Demo](https://www.youtube.com/watch?v=kU2mamjU3Tg)** • **[Report Bug](https://github.com/yourusername/frigley-ai/issues)** • **[Request Feature](https://github.com/yourusername/frigley-ai/issues)**

</div>

---

## 📖 About The Project

We've all been there—staring into an open fridge, wondering what to cook, or throwing away expired produce we forgot we bought. **Frigley AI** was built to solve the "What's for dinner?" problem while tackling household food waste head-on.

### ✨ Key Features

- **📸 AI-Powered Recognition** – Upload a photo of your fridge or groceries, and our Computer Vision model (YOLOv8) automatically identifies ingredients and logs them to your inventory
- **⚠️ Smart Expiry Tracking** – Automatically estimates shelf life and alerts you before your food goes bad
- **🍳 Gemini Recipe Generator** – Powered by Google Gemini, Frigley suggests creative recipes using *only* the ingredients you currently have
- **🛒 Automated Shopping Lists** – Generates smart shopping lists to restock essentials or complete a specific recipe

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database | AI & ML |
|----------|---------|----------|---------|
| React (Vite) | Python | MongoDB | YOLOv8 |
| Tailwind CSS | FastAPI | | Google Gemini API |
| Framer Motion | | | |

</div>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16+) & npm
- Python 3.9+
- MongoDB Atlas URI (or local instance)
- Google Gemini API Key

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/frigley-ai.git
   cd frigley-ai
```

2. **Backend Setup**
```bash
   cd backend
   python -m venv venv
   
   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` folder:
```env
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_api_key
```

4. **Start the Backend Server**
```bash
   uvicorn main:app --reload
```

5. **Frontend Setup**
   
   Open a new terminal:
```bash
   cd frontend
   npm install
   npm run dev
```

6. **Access the Application**
   
   Navigate to `http://localhost:5173` in your browser

---

## 💡 How To Use

<div align="center">

| Step 1: Scan | Step 2: Review | Step 3: Cook |
|--------------|----------------|--------------|
| 📸 Take a picture of your grocery haul | 👀 Watch as Frigley populates your digital fridge | 🍳 Click "Generate Recipe" for a custom meal plan |

</div>

---

## 📺 Demo Video

[![Frigley AI Demo](https://img.youtube.com/vi/kU2mamjU3Tg/maxresdefault.jpg)](https://www.youtube.com/watch?v=kU2mamjU3Tg)

*Click the image above to watch the full demo*

---

## 🗺️ Roadmap

- [x] Core ingredient recognition
- [x] Recipe generation with Gemini
- [x] Shopping list automation
- [ ] Nutrition tracking
- [ ] Multi-user household support
- [ ] Mobile app (iOS & Android)
- [ ] Voice assistant integration

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.


---

<div align="center">

**Built with ❤️ and a lot of ☕**

⭐ Star this repo if you find it helpful!

</div>
