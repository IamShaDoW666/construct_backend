// export const createReference = (ref: string) => {
//     return "REF" + Math.random().toString(36).slice(2, 6) + ref
// }

export const createReference = (ref: string) => {
    return "REF" + Math.floor(1000 + Math.random() * 9000).toString() + ref
}