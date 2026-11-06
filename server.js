import express from "express";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Patient data
let patients = [];

// Custom logger middleware
const logger = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const period = Date.now() - start;

        const log = `${req.method} ${req.originalUrl} ${res.statusCode} - ${period}ms`;

        fs.appendFile("server.log", log + "\n", (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

    next();
};

// Patient validation middleware
const validatePatient = (req, res, next) => {
    const { name, age, word } = req.body;

    if (!name || !age || !word) {
        return res.status(400).json({
            message: "Invalid patient data"
        });
    }

    next();
};

// Apply custom logger
app.use(logger);



app.post("/api/v1/patients", validatePatient, (req, res) => {

    const { name, age, word } = req.body;

    const newPatient = {
        id: patients.length + 1,
        name,
        age,
        word
    };

    patients.push(newPatient);

    res.status(201).json({
        message: "Patient created successfully"
    });
});



app.get("/api/v1/patients", (req, res) => {

    res.status(200).json({
        message: "Patients fetched successfully",
    });

});




app.get("/api/v1/patients/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const patient = patients.find(p => p.id === id);

    if (!patient) {
        const err = new Error("Patient not found");
        err.statusCode = 404;
        throw err;
    }

    res.status(200).json({
        message: "Patient details fetched successfully"
    });

});




app.put("/api/v1/patients/:id", validatePatient, (req, res) => {

    const id = parseInt(req.params.id);

    const patient = patients.find(p => p.id === id);

    if (!patient) {
        const err = new Error("Patient not found");
        err.statusCode = 404;
        throw err;
    }

    const { name, age, word } = req.body;

    patient.name = name;
    patient.age = age;
    patient.word = word;

    res.status(200).json({
        message: "Patient updated successfully"
    });

});



app.delete("/api/v1/patients/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const index = patients.findIndex(p => p.id === id);

    if (index === -1) {
        const err = new Error("Patient not found");
        err.statusCode = 404;
        throw err;
    }

    const deletedPatient = patients.splice(index, 1);

    res.status(200).json({
        message: "Patient deleted successfully"
    });

});



app.use((err, req, res, next) => {

    console.error(err.stack);

    const statusCode = err.statusCode || 500;

    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        message
    });

});




app.use((req, res) => {

    res.status(404).json({
        message: "Resource not found"
    });

});




app.listen(port, () => {

    console.log(`Server is running on http://localhost:${port}/`);

});
//C:\Users\Admin>curl -X POST http://localhost:3000/api/v1/patients -H "Content-Type: application/json" -d "{\"name\":\"Sushma\",\"age\":30,\"word\":\"ICU\"}"
//{"message":"Patient created successfully"}
//C:\Users\Admin>curl -X POST http://localhost:3000/api/v1/patients -H "Content-Type: application/json" -d "{\"name\":\"Ravi\",\"age\":45,\"word\":\"General\"}"
//{"message":"Patient created successfully"}
//C:\Users\Admin>curl http://localhost:3000/api/v1/patients
//{"message":"Patients fetched successfully"}
//C:\Users\Admin>curl http://localhost:3000/api/v1/patients/1
//{"message":"Patient details fetched successfully"}
//C:\Users\Admin>curl -X PUT http://localhost:3000/api/v1/patients/1 -H "Content-Type: application/json" -d "{\"name\":\"Sushma Updated\",\"age\":31,\"word\":\"Emergency\"}"
//{"message":"Patient updated successfully"}
//C:\Users\Admin>curl -X DELETE http://localhost:3000/api/v1/patients/1
//{"message":"Patient deleted successfully"}