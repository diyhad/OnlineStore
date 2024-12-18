# Barrette Online Store

Welcome! This web store is designed for salon Barrette.

## Installation

To install and run the API, follow these steps:

1. **Clone the repository:**
    ```shell
    git clone https://github.com/ddhad/barrette-online-store
    ```

2. **Set up the virtual environment:**
    ```shell
    cd barrette-online-store
    python3 -m venv myenv
    ```
    To activate it:
    ```shell
    source myenv/bin/activate
    ```
    On Windows:
    ```shell
    myenv\Scripts\activate
    ```
    **Or use your IDE**
3. **Install the project dependencies:**
    ```shell
    pip install -r requirements.txt
    ```


## Build database
   ```shell
    cd db
    python3 build_database.py
    cd ..
   ```


## Usage

1. Run API  
    **uvicorn main:app --host <host_address> --port <port_number> --reload**  
    ```shell
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```
    Or locally:
    ```shell
    uvicorn main:app --reload
    ```  
2. Call endpoints  
    <pre>
    /
    /product/1
    </pre>


./ngrok http 8000  
uvicorn main:app --reload --host 127.0.0.1 --port 8000
