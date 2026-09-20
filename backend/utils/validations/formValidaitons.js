let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password



export const validateFullName = (fullname) => {
    if (!fullname || fullname.trim().length < 3)

    if (!/^[a-zA-Z\s]+$/.test(fullname)) {
            return 'Full name can only contain letters and spaces.';
        }
    return null ;
}

export const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return 'Email is required.';
    }
    if (!emailRegex.test(email)) {
        return 'Email is invalid.';
    }
    return null;
}

export const validatePassword = (password) => {
    if (!password || password.trim() === '') {
        return 'Password is required.';
    }
    if (!passwordRegex.test(password)) {
        return 'Password should be 6 to 20 characters long with 1 numeric, 1 lowercase and 1 uppercase.';
    }
    return null;
}



