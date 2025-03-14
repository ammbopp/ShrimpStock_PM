const schedule = require('node-schedule');

// Import your database connection
const connection = require('./src/db/database.js');

function checkAndCreateAudit(callback) {
    // Get the latest audit to check its payment_due_date
    const getLatestQuery = `SELECT * FROM AUDITS ORDER BY payment_due_date DESC LIMIT 1;`;

    connection.query(getLatestQuery, (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            // Continue with callback even if there's an error
            return callback(error);
        }

        // Get today's date on the server
        const today = new Date();
        let shouldCreateNewAudit = false;

        // If no audits exist yet, we should create one
        if (results.length === 0) {
            shouldCreateNewAudit = true;
        } else {
            // Get the latest payment_due_date
            const latestAudit = results[0];
            const latestDueDate = new Date(latestAudit.payment_due_date);

            // Calculate the difference in days
            const diffTime = today.getTime() - latestDueDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Check if more than 70 days have passed
            shouldCreateNewAudit = diffDays > 70;
        }

        if (shouldCreateNewAudit) {
            // Create a new audit with due date set to today + 70 days
            const newDueDate = new Date();
            console.log(newDueDate.getDate());
            newDueDate.setDate(newDueDate.getDate() + 70);

            const newAuditId = `AUDIT-${Date.now()}`;
            const createAuditQuery = `
          INSERT INTO AUDITS (audit_id, payment_due_date, payment_status) 
          VALUES (?, ?, 0);
        `;

            connection.query(createAuditQuery, [newAuditId, newDueDate], (createError) => {
                if (createError) {
                    console.error('Error creating new audit:', createError);
                } else {
                    console.log('New audit created successfully', newAuditId);
                }
                // Continue with callback regardless of result
                callback(null);
            });
        } else {
            // No new audit needed, continue with callback
            callback(null);
        }
    });
}

// Setup scheduler
function initSchedulers() {
    // Schedule the task to run at 11:59:59 PM daily
    const dailyJob = schedule.scheduleJob('59 59 23 * * *', function () {
        console.log('Running scheduled audit check at', new Date().toISOString());

        checkAndCreateAudit((error) => {
            if (error) {
                console.error('Scheduled audit check failed:', error);
            } else {
                console.log('Scheduled audit check completed successfully');
            }
        });
    });

    console.log('Daily audit check scheduled to run at 11:59:59 PM');
    return dailyJob;
}

module.exports = { initSchedulers };