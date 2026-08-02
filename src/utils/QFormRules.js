/**
 * A collection of standard form validation rules for QInput.
 * Usage: rules: [QFormRules.required(), QFormRules.email()]
 */
export const QFormRules = {
    required: (msg = 'Field is required') => {
        return (val) => {
            if (val === null || val === undefined) return msg;
            if (typeof val === 'string' && val.trim().length === 0) return msg;
            if (Array.isArray(val) && val.length === 0) return msg;
            return true;
        };
    },
    
    email: (msg = 'Invalid email address') => {
        return (val) => {
            if (!val) return true; // Let 'required' handle emptiness
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(val) || msg;
        };
    },
    
    phone: (msg = 'Invalid phone number') => {
        return (val) => {
            if (!val) return true;
            const regex = /^\+?[\d\s\-\(\)]{7,20}$/;
            return regex.test(val) || msg;
        };
    },
    
    url: (msg = 'Invalid URL') => {
        return (val) => {
            if (!val) return true;
            const regex = /^https?:\/\/.*/i;
            return regex.test(val) || msg;
        };
    },
    
    number: (msg = 'Must be a valid number') => {
        return (val) => {
            if (!val) return true;
            return !isNaN(Number(val)) || msg;
        };
    },
    
    minLength: (length, msg) => {
        return (val) => {
            if (!val) return true;
            const errorMsg = msg || `Minimum ${length} characters required`;
            return val.length >= length || errorMsg;
        };
    },
    
    maxLength: (length, msg) => {
        return (val) => {
            if (!val) return true;
            const errorMsg = msg || `Maximum ${length} characters allowed`;
            return val.length <= length || errorMsg;
        };
    },
    
    regex: (pattern, msg = 'Invalid format') => {
        return (val) => {
            if (!val) return true;
            return pattern.test(val) || msg;
        };
    }
};
