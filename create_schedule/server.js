const express = require('express');
const {exec} = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/login', (req, res) => {
    const {email, password} = req.body
    exec(`python3 ./scripts/PortalLogin.py "${email}" "${password}" "initial login"`, 
    (error, stdout, stderr) => {
        if (error){
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        res.send(`Output: ${stdout}`);
    });
});

app.post('/get_classes', (req, res) => {
    const {email, password, session, type, year, headless} = req.body
    console.log(session, type, year)
    const filePath = path.join(__dirname, session + type + year +'ClassList.txt')
    console.log(filePath)
    exec(`python3 ./scripts/FetchClasses.py "${email}" "${password}" "${session}" "${type}" "${year}" "${headless}"`, 
    (error, stdout, stderr) => {
        console.log(stdout)
        out = stdout.split('\n')
        if(out.includes('Option not available')){
            console.log("hmm")
            return res.status(400).send('Option not available for class search')
        }
        if (error){
            console.log("hmmmmmmm")
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if(err){
                console.error(`File does not exist: ${filePath}`);
                return res.status(500).send('File not found');
            }
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err){
                    console.error(`File read error: ${err}`);
                    return res.status(500).send('Error reading file')
                }
                try{
                    res.sendFile(path.resolve(filePath))
                }catch(e){
                    console.error(`JSON parse error: ${e}`);
                    res.status(500).json({ error: 'Error parsing JSON' });
                }
            }
            )
        })
    });
});

app.post('/get_students', (req, res) => {
    const {email, password, term, yourClasses, headless} = req.body
    const courses = Object.values(yourClasses).map(obj => `"${obj.course_number}"`).join(' ');
    exec(`python3 ./scripts/FetchStudents.py "${email}" "${password}" ${headless} "${term}" ${courses}`, 
    (error, stdout, stderr) => {
        res.send(`Output: ${stdout}, ${stderr}, ${error}`)
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})

