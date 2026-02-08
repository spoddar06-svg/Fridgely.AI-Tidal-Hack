"""
Quick MongoDB Connection Test
Run this to verify your MongoDB Atlas connection works
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fridgetrack")


async def test_mongodb():
    """Test MongoDB connection and basic operations"""

    print("=" * 60)
    print("Testing MongoDB Connection...")
    print("=" * 60)
    print()

    # Check if credentials are loaded
    if not MONGODB_URL or MONGODB_URL == "mongodb+srv://username:password@cluster.mongodb.net/":
        print("ERROR: MONGODB_URL not configured in .env file!")
        print("   Please update your .env file with your actual MongoDB connection string.")
        return

    try:
        # 1. Connect to MongoDB
        print("[1/7] Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(MONGODB_URL)
        database = client[DATABASE_NAME]

        # 2. Test connection with ping
        print("[2/7] Pinging database...")
        await client.admin.command('ping')
        print("   SUCCESS: Ping successful! MongoDB is reachable.")
        print()

        # 3. List existing collections
        print("[3/7] Checking collections in database...")
        collections = await database.list_collection_names()
        if collections:
            print(f"   Found {len(collections)} collection(s):")
            for col in collections:
                count = await database[col].count_documents({})
                print(f"      - {col}: {count} document(s)")
        else:
            print("   No collections found yet (this is normal for a new database)")
        print()

        # 4. Test write operation
        print("[4/7] Testing write operation...")
        test_collection = database.test_items
        test_doc = {
            "test": "Hello from FridgeTrack!",
            "status": "testing"
        }
        result = await test_collection.insert_one(test_doc)
        print(f"   SUCCESS: Write successful! Document ID: {result.inserted_id}")
        print()

        # 5. Test read operation
        print("[5/7] Testing read operation...")
        doc = await test_collection.find_one({"_id": result.inserted_id})
        print(f"   SUCCESS: Read successful! Found: {doc['test']}")
        print()

        # 6. Clean up test data
        print("[6/7] Cleaning up test data...")
        await test_collection.delete_one({"_id": result.inserted_id})
        print("   SUCCESS: Cleanup successful!")
        print()

        # 7. Create indexes for your collections
        print("[7/7] Creating indexes for FridgeTrack collections...")
        await database.inventory_items.create_index("user_id")
        await database.inventory_items.create_index("expiration_date")
        await database.scans.create_index("user_id")
        print("   SUCCESS: Indexes created!")
        print()

        # Success summary
        print("=" * 60)
        print("SUCCESS! MongoDB is fully configured and working!")
        print("=" * 60)
        print()
        print("Database Info:")
        print(f"   - Database Name: {DATABASE_NAME}")
        print(f"   - Connection: Active")
        print(f"   - Collections: {len(await database.list_collection_names())}")
        print()
        print("You're ready to run your FastAPI server!")
        print("   Run: python main.py")
        print()

    except Exception as e:
        print()
        print("=" * 60)
        print("ERROR: MongoDB Connection Failed!")
        print("=" * 60)
        print()
        print(f"Error details: {str(e)}")
        print()
        print("Common issues:")
        print("   1. Check your MONGODB_URL in .env file")
        print("   2. Make sure your IP is whitelisted in MongoDB Atlas")
        print("   3. Verify your MongoDB username/password are correct")
        print("   4. Check your internet connection")
        print()

    finally:
        # Close connection
        client.close()


if __name__ == "__main__":
    asyncio.run(test_mongodb())
