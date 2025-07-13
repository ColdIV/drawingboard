# Drawing Board
A small web application which lets you draw images on a canvas.

The color of the pen will change with every time you click on the canvas.

Images can be saved on the server.

If you find an image that's inappropriate, you can flag it with the report button and it wont be shown until it has been reviewed manually.

# Setup
    git clone https://github.com/ColdIV/drawingboard.git
    cd drawingboard
    virtualenv env
### Linux
    source env/bin/activate
### Windows
    .\env\Scripts\activate
### Install requirements    
    pip install -r requirements.txt
## Config
Rename `.config.example` to `.config` and add a port and a secret key

# Run
Run the script with `python app.py dev` for development or with `python app.py` for production
