// Average service time per token in minutes
const AVERAGE_SERVICE_TIME = 5;

// Calculate estimated waiting time based on queue position
const calculateWaitingTime = (queuePosition) => {
    return queuePosition * AVERAGE_SERVICE_TIME;
};

module.exports = { calculateWaitingTime };
