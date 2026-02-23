/**
 * Calculates the age in full years from a date-of-birth string.
 * @param dateOfBirth - ISO date string or any date string parseable by `new Date()`.
 * @returns The age as a number, or `null` if the input is falsy / invalid.
 */
export function calculateAge(dateOfBirth: string | null | undefined): number | null {
    if (!dateOfBirth) return null;

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();

    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!hasHadBirthdayThisYear) {
        age -= 1;
    }

    return age;
}
