// Function to generate OTP and its expiration time
const generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiration = Date.now() + 5 * 60 * 1000;
    return { otp, otpExpiration };
};

// Function to generate alphanumeric OTP with both uppercase, lowercase, and numbers
const generateAlphanumericOTP = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters[randomIndex];
    }
    const otpExpiration = Date.now() + 5 * 60 * 1000;
    return { otp, otpExpiration };
};

module.exports = { generateOTP, generateAlphanumericOTP };
