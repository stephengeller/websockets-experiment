Websockets Experiment
=====================

# How to install
Clone the repository, install the dependencies and start the server
```bash
git clone https://github.com/stephengeller/websockets-experiment.git
cd websockets-experiment
npm install
npm run dev # starts a server at port 4000, or whatever $PORT is set to in your environment
```
### Environment Variables
You will need to configure your environment to work with a mongodb database, either locally or remotely. I use [mLab](https://mlab.com/home), which allows you to set up a remote database for both production and development environments. 

To get a minimum setup, setup a `.env` file in the root project directory with the following variables:
```dotenv
ENVIRONMENT=<EITHER PROD OR DEV, OR WHATEVER YOU WANT>
MONGO_USER=<MLAB DB USER>
MONGO_PASS=<MLAB DB PASS>
DB_NAME=<YOUR_URI>.mlab.com:<SOME_NUMBERS>/<DB_NAME> # find this in mLab,
```
These variables will be interpolated in `app.js` to setup your connection to mLab's Mongo DB. Alternatively, edit the file to point to a local mongo db if desired.

# How to use
TBC
