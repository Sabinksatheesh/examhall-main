const { spawn } = require('node:child_process');
async function totalCount(data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data);
        const pythonProcess = spawn('python', ['totalStudents.py', jsonData]);

        let result = '';

        pythonProcess.stdout.on('data', (data) => {
            console.log("Raw Python Output:", data.toString()); // Debugging
            result += data.toString();
        });
// console.log("Result:",result);

        pythonProcess.stderr.on('data', (data) => {
            console.error("Python Error:", data.toString());
            reject(data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const parsedResult = JSON.parse(result.trim()); // Ensure JSON parsing
                    resolve(parsedResult);
                } catch (error) {
                    reject('Invalid JSON output from Python script');
                }
            } else {
                reject(`Python script exited with code ${code}`);
            }
        });

        pythonProcess.on('error', (error) => {
            console.error("Process Error:", error);
            reject(error);
        });
    });
}


module.exports = totalCount;