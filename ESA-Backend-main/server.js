const connectDB = require('./config/connectDB');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middlewares/credentials');
const express = require('express');
const mongoose = require('mongoose');
const verifyJWT = require('./middlewares/verifyJWT');
const Slot = require('./models/Slot');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5500;

connectDB();

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));


// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// routes
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use(verifyJWT);

app.use('/manage-room', require('./routes/manageRoom'));
app.use('/university-exam', require('./routes/universityExam'));
app.use('/seat-allocation', require('./routes/seatAllocation'));


const subjectCodes = [
    "DISCRETE MATHEMATICAL STRUCTURES ( MAT203 )",
    "PARTIAL DIFFERENTIAL EQUATION AND COMPLEX ANALYSIS ( MAT201 )",
    "DATA STRUCTURES ( CST201 )",
    "MECHANICS OF SOLIDS ( CET201 )",
    "CIRCUITS AND NETWORKS ( EET201 )",
    "SOLID STATE DEVICES ( ECT201 )",
    "MECHANICS OF SOLIDS ( MET201 )",
    "LOGIC SYSTEM DESIGN ( CST203 )",
    "FLUID MECHANICS AND HYDRAULICS ( CET203 )",
    "MEASUREMENTS AND INSTRUMENTATION ( EET203 )",
    "LOGIC CIRCUIT DESIGN ( ECT203 )",
    "MECHANICS OF FLUIDS ( MET203 )",
    "OBJECT ORIENTED PROGRAMMING USING JAVA ( CST205 )",
    "SURVEYING AND GEOMATICS ( CET205 )",
    "ANALOG ELECTRONICS ( EET205 )",
    "NETWORK THEORY ( ECT205 )",
    "METALLURGY AND MATERIAL SCIENCE ( MET205 )",
    "DESIGN AND ENGINEERING ( EST200 )",
    "PROFESSIONAL ETHICS ( HUT200 )",
    "SUSTAINABLE ENGINEERING ( MCN201 )",
    "DATA STRUCTURES LAB ( CSL201 )",
    "CIVIL ENGINEERING PLANNING AND DRAFTING LAB ( CEL201 )",
    "CIRCUITS AND MEASUREMENTS LAB ( EEL201 )",
    "SCIENTIFIC COMPUTING LAB ( ECL201 )",
    "COMPUTER AIDED MACHINE DRAWING ( MEL201 )",
    "OBJECT ORIENTED PROGRAMMING LAB (IN JAVA) ( CSL203 )",
    "SURVEY LAB ( CEL203 )",
    "ANALOG ELECTRONICS LAB ( EEL203 )",
    "LOGIC DESIGN LAB ( ECL203 )",
    "MATERIALS TESTING LAB ( MEL203 )"
  ];
  
  mongoose.connection.once('open', async () => {
    console.log('Connected to MongoDB');
    // try {
    //   const result = await Slot.updateMany({}, { subcode: subjectCodes });
    //   console.log(`Updated ${result.modifiedCount} documents.`);
    // } catch (err) {
    //   console.error('Error updating Slot documents:', err);
    // }
  
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}...`);
    });
  });