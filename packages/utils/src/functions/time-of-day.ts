export const timeOfDay = (date: number | Date): string => {
    const hours = new Date(date).getHours()

    if (hours < 12) return 'Morning'
    if (hours < 17) return 'Afternoon'
    return 'Evening'
}
