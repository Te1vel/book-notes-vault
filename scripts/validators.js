export function validateTitle(val) {
    return /^\S(?:.*\S)?$/.test(val) && !/\s{2,}/.test(val);
}

export function validateAuthor(val) {
    return /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/.test(val);
}

export function validatePages(val) {
    return /^[1-9]\d*$/.test(val);
}

export function validateDate(val) {
    return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(val);
}

export function validateTag(val) {
    return /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(val);
}

export function hasDuplicateWords(val) {
    return /\b(\w+)\s+\1\b/i.test(val);
}