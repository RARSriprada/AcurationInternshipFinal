# DocLens

> Upload any document, get its essence in minutes, and then have a natural conversation with it.

![DocLens Screenshot](https://i.imgur.com/your-screenshot-url.png)
*(It's highly recommended to replace the link above with a real screenshot or GIF of your application in action!)*

---

## 📋 Table of Contents

* [Functionalities](#-functionalities)
* [How It Works](#-how-it-works)
* [Tech Stack](#-tech-stack)
* [Getting Started](#-getting-started)
    * [Prerequisites](#prerequisites)
    * [Backend Setup](#backend-setup)
    * [Frontend Setup](#frontend-setup)
* [Usage](#-usage)
* [Contributing](#-contributing)
* [License](#-license)

---

## ✨ Functionalities

* **Look into your doc →** The system extracts text from PDFs or websites and structures it for AI.

* **Grab the summary →** You instantly receive a clear, concise summary, so you don’t have to read hundreds of pages.

* **Ask anything →** Through an interactive chat, you can query details, clarify points, or explore deeper insights, with suggested questions guiding you.

* **Always accessible →** Instead of just static summaries, it’s like having a smart assistant who has read the entire document for you and is ready to answer follow-ups on demand.

---

## ⚙️ How It Works

### Important Modules

* **OCR (Optical Character Recognition)**
    * Like Google Lens for your PDFs — it can read text even from scanned documents or images.
    * *Example: Upload a scanned offer letter → OCR extracts the text so AI can process it.*

* **RAG (Retrieval-Augmented Generation)**
    * Think of it like ChatGPT with “deep search” turned on. Instead of guessing, it searches your document for relevant chunks and answers based *only* on that information.
    * *Example: Ask "What was the base salary?" → RAG fetches the exact table and gives the grounded answer.*

* **Orchestrator**
    * Acts as the project manager for the AI, deciding which tool to use and when. It handles the logic for when to use OCR, when to build the RAG index, and when to switch into chat mode, ensuring each module runs at the right time.

### The Actual Workflow

![DocLens Workflow](image.png)

---

## 🛠️ Tech Stack

* **Backend:**
    * Python 3.x
    * FastAPI (for the web server)
    * LangChain (for the AI pipeline)
    * Google Generative AI (for LLM and embeddings)
    * FAISS (for vector storage)
    * PyMuPDF, Pytesseract & Pillow (for PDF/OCR processing)
    * BeautifulSoup4 (for web scraping)
* **Frontend:**
    * React (with TypeScript)
    * TailwindCSS (for styling)
    * Lucide React (for icons)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

1.  **Python & Node.js:** Ensure you have Python 3.8+ and Node.js v18+ installed.
2.  **Tesseract OCR:** This is required for processing scanned PDFs.
    * Download and install it from the [official Tesseract documentation](https://tesseract-ocr.github.io/tessdoc/Installation.html).
    * **Crucially, ensure you add Tesseract to your system's PATH during installation.**
3.  **Google API Key:**
    * You need a Google Generative AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Create a virtual environment and install dependencies:**
    ```bash
    # Create a virtual environment
    python -m venv venv

    # Activate it (Windows)
    .\venv\Scripts\activate

    # Activate it (macOS/Linux)
    source venv/bin/activate

    # Install Python packages
    pip install -r requirements.txt
    ```
    *(Note: You will need to create a `requirements.txt` file. You can generate one from your activated virtual environment using `pip freeze > requirements.txt`)*

3.  **Create a `.env` file** in the root project directory and add your API key:
    ```
    GOOGLE_API_KEY="your_google_api_key_here"
    ```

### Frontend Setup

1.  **Navigate to the frontend directory** (assuming your React app is in a subfolder like `frontend/`):
    ```bash
    cd frontend/
    ```

2.  **Install npm packages:**
    ```bash
    npm install
    ```

---

## ▶️ Usage

1.  **Start the Backend Server:**
    In a terminal, from the root directory (with your virtual environment activated), run the FastAPI application:
    ```bash
    uvicorn api:app --reload
    ```
    The backend will now be running at `http://1.2.3.4:8000`.

2.  **Start the Frontend Application:**
    In a **separate terminal**, from the `frontend/` directory, run the React development server:
    ```bash
    npm start
    ```
    The application will open in your browser, usually at `http://localhost:3000`.

3.  Upload a document or paste a URL to begin!

---

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve DocLens, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
