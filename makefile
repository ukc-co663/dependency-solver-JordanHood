all:
	-apt update -y
	-apt install curl -y
	-curl -sL https://deb.nodesource.com/setup_8.x | bash
	-apt install -y nodejs
	-npm install