echo "Installing Dependencies"
pip install -r requirements.txt
echo "Installation Complete"
echo "Installing gstreamer rtspclient"
sudo apt install gstreamer1.0-rtsp
echo "gstreamer installed"
echo " run ./rtsp_sink.sh"