const Schedule = require('../models/Schedule');
const Room = require('../models/Room');
const Allocations = require('../models/Allocations');
const manipulate = require('../manipulate');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const totalCount = require('../totalCount');
const xlsx = require('xlsx');

const directoryPath = path.resolve(__dirname, '../updatedExcels');
const fileNameRegex = /^([0][1-9]|[12][0-9]|3[01])-([0][1-9]|[1][0-2])+-([0-9]{4})+_[FA]N\.xlsx$/;

const getDates = async (req, res) => {
    const user = req.user.username;

    try {
        const dates = await Schedule.distinct('date', { user });
        const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
        const formattedDates = sortedDates.map(date => {
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        });
        return res.status(200).send(formattedDates);
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
};

const getExams = async (req, res) => {
    const { date, time } = req.query;
   // console.log(req.query);
    const user = req.user.username;
    if (!date || !time) {
        return res.status(400).json({ 'message': 'provide date and time' });
    }

    try {
        const formattedDate = date.split('-').reverse().join('-');
        const dateObject = new Date(formattedDate).toISOString();

        const schedules = await Schedule.find({ date: dateObject, time: time, user: user }).select('sem branch slot subcode').lean();

        const exams = schedules.reduce((acc, { sem, branch, slot }) => {
            const exam = `S${sem}-${branch}-${slot}`;
            acc.push(exam);
            return acc;
        }, []);

        if (exams?.length === 0) {
            exams.push("No exams scheduled");
            return res.status(200).json({ exams, details: null, totalStudents: 0 });
        }
        const details = schedules.map(({ sem, branch, slot, subcode }) => {
            return { sem, branch, slot, subcode };
        });

        const totalStudents = await totalCount({ details });
        console.log(totalStudents);

        return res.status(200).json({ exams, details, totalStudents });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 'message': error.message });
    }
};

const getRooms = async (req, res) => {
    const user = req.user._id;
    try {
        const rooms = await Room.find({ user }).select('room_no capacity');
        return res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ 'message': err.message });
    }
};

const createAllocation = async (req, res) => {
    const user = req.user.username;
    const { date, time, rooms, details } = req.body;
    // console.log(req.body);
    if (!date || !time || !rooms || !details) {
        return res.status(400).json({ 'message': 'provide date, time and rooms' });
    }
    const totalCapacity = rooms.reduce((total, obj) => total + obj.capacity, 0);
    console.log("here", totalCapacity);
    const formattedDate = date.split('-').reverse().join('-');
    const dateObject = new Date(formattedDate).toISOString();
    //console.log(dateObject)
    try {
        // First, find the schedule document that matches the given date, time, and subcode
        const schedule = await Schedule.findOne({ user, date: dateObject, time });

        // If a matching schedule document is found, create a new exam document with the required fields
        if (schedule) {

            await manipulate(req.body); // function for manipulating the uploadedExcel file for seat arrangement

            const newAllocation = new Allocations({
                user: req.user.username,
                date: dateObject,
                time,
                rooms,
                seats: totalCapacity
            });

            await newAllocation.save();

            // Return the newly created exam document or any other relevant data
            res.status(201).json({ "message": 'Allocation created successfully', "Allocation": newAllocation });
        }
        else {
            // If no matching schedule document is found, return an appropriate error message
            res.status(404).json({ "error": 'No schedule found for the given date and time' });
        }

    } catch (error) {
        return res.status(500).json({ 'message': error.message });
    }
};

const getAllocation = async (req, res) => {
    const { date, time } = req.query;
    console.log(req.query);
    const user = req.user.username;
    if (!date || !time) {
        return res.status(400).json({ 'message': 'provide date and time' });
    }
    try {
        const formattedDate = date.split('-').reverse().join('-');
        const dateObject = new Date(formattedDate).toISOString();
        const allocations = await Allocations.find({ user, date: dateObject, time: time }).select('rooms seats').lean();
        const rooms = allocations?.flatMap(allocation => allocation.rooms.map(item => item.room_no));
        const seatSelected = allocations.length === 0 ? 0 : allocations[0].seats;
        return res.status(200).json({ rooms, seats: seatSelected });
    }
    catch (error) {
        return res.status(500).json({ 'message': error.message });
    }
};

const sendExcels = async (req, res) => {
    const { files } = req.query; // e.g., ['2024-04-02_FN.xlsx']
    const userEmail = req.user.email;
  
    const uploadedPath = path.join(__dirname, '..', 'uploadedExcels');
    const excelPath = path.join(__dirname, '..', 'updatedExcels');
  
    try {
      const allStudents = new Set();
  
      // Extract emails from uploadedExcels folder
      const uploadedFiles = await fs.promises.readdir(uploadedPath);
      for (const file of uploadedFiles) {
        const wb = xlsx.readFile(path.join(uploadedPath, file));
        wb.SheetNames.forEach(sheet => {
          const data = xlsx.utils.sheet_to_json(wb.Sheets[sheet], { header: 1 });
          data.forEach(row => {
            const email = row[8]; // Column I = index 8
            if (email && typeof email === 'string' && email.includes('@')) {
              allStudents.add(email.trim());
            }
          });
        });
      }
  
      const attachments = files.map(filename => ({
        filename,
        path: path.join(excelPath, filename)
      }));
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD
        }
      });
  
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: userEmail,
        bcc: Array.from(allStudents),
        subject: "Exam Hall Seat Arrangement",
        text: "Dear Students,\n\nAttached is your seat arrangement.\n\nRegards,\nExam Cell",
        attachments
      });
  
      return res.status(200).json({ message: "Mail sent successfully!" });
  
    } catch (err) {
      console.error("Email sending failed:", err);
      return res.status(500).json({ message: "Internal error sending email" });
    }
  };
  
module.exports = { getExams, getRooms, getDates, createAllocation, getAllocation, sendExcels };