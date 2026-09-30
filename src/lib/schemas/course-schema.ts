import { z } from "zod";

import type { Course } from "../types";


export const COURSE_TITLE_MAX = 100;
export const INSTRUCTOR_MAX = 3;

export const courseFormSchema = z.object({
    courseId: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
    courseTitle: z
        .string()
        .trim()
        .min(1, "กรอกชื่อวิชา")
        .max(COURSE_TITLE_MAX, `ความยาวไม่เกิน ${COURSE_TITLE_MAX}`),
    instructors: z
        .array(
            z.object({
                name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
                email: z
                    .email("อีเมลไม่ถูกต้อง")
                    .trim()
                    .regex(
                        /^[a-zA-Z0-9._%+-]+@cmu\.ac\.th$/,
                        { message: "ต้องเป็นอีเมล @cmu.ac.th" }
                    ),
            }))
        // ─── Array Validation: ตรวจทั้งรายการ ───
        .min(1, "ต้องมีอีเมลอย่างน้อย 1 อีเมล")
        .max(INSTRUCTOR_MAX, `ผู้สอนได้ไม่เกิน ${INSTRUCTOR_MAX} อีเมล`)
        .refine(
            (items) => {
                return new Set(items.map((i) => i.email.toLowerCase())).size === items.length;
            },
            "อีเมลผู้สอนซ้ำกัน",
        ),
    program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
    semester: z.enum(["1", "2", "3"], "เลือกภาคการศึกษา"),
    description: z.string(),
    notifyByEmail: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export function createCourseFormSchema(existingStudents: Course[]) {
    return courseFormSchema.refine(
        (data) => !existingStudents.some((s) => s.courseId === data.courseId),
        { message: "รหัสวิชานี้มีอยู่แล้ว", path: ["courseId"] },
    );
}