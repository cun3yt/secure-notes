from dotenv import load_dotenv
import os

# Load the development environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env.development'))

# Rest of your existing code... 