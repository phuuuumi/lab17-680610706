import { useMemo, useState } from "react";
import { PlusCircle, X, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
*/
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { createCourseFormSchema, type CourseFormValues, INSTRUCTOR_MAX } from "@/lib/schemas/course-schema";
import {
  useForm,
  type DefaultValues,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Switch } from "../ui/switch";


const programOptions = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
];

const emptyCourseForm: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  instructors: [{ name: "", email: "" }],
  program: undefined,
  semester: undefined,
  description: "",
  notifyByEmail: false,
};

export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  // state ที่ต้องถือเองสามก้อน (Zod + React Hook Form จะรวมเป็น useForm ตัวเดียว)
  // const [values, setValues] = useState<CourseFormValues>(emptyCourseForm);
  // const [errors, setErrors] = useState<CourseFormErrors>({});
  // const [touched, setTouched] = useState<
  //   Partial<Record<keyof CourseFormValues, boolean>>
  // >({});

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  const resetForm = () => {
    form.reset(emptyCourseForm);
  };

  // ด่านตรวจก่อนเข้า store — เทียบได้กับ form.handleSubmit(onSubmit)
  function onSubmit(values: CourseFormValues) {
    addCourse(values);
    resetForm();
    setOpen(false);
  };

  const instructorsError =
    form.formState.errors.instructors?.root ?? form.formState.errors.instructors;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              กรอกรหัสวิชา ชื่อวิชา และผู้สอน
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="courseId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="courseId">
                      รหัสวิชา
                    </FieldLabel>
                    <Input
                      {...field}
                      id="courseId"
                      placeholder="เช่น 261305"
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid &&
                      <FieldError errors={[fieldState.error]} />
                    }
                  </Field>
                )}
              />
              <div className="col-span-2">
                <Controller
                  name="courseTitle"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="lastName">ชื่อวิชา</FieldLabel>
                      <Input
                        {...field}
                        id="courseTitle"
                        placeholder="เช่น Mobile Application Development"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
            <Controller
              name="program"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="program">หลักสูตร</FieldLabel>
                  <Select
                    name={field.name}
                    items={programOptions}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur();
                    }}
                  >
                    <SelectTrigger
                      id="program"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                      ref={field.ref}
                    >
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>
                    <SelectContent>
                      {programOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="semester"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="program">ภาคการศึกษา</FieldLabel>
                  <RadioGroup
                    name={field.name}
                    value={field.value ?? null}
                    onValueChange={(v) => {
                      field.onChange(v);
                      field.onBlur();
                    }}
                  >
                    <div className="flex grid gap-1 sm:grid-cols-4">
                      <Field orientation="horizontal">
                        <RadioGroupItem value={"1"} id="semester1" />
                        <FieldLabel htmlFor="semester" className="font-normal">
                          ภาคการศึกษาที่ 1
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value={"2"} id="semester2" />
                        <FieldLabel htmlFor="semester-2" className="font-normal">
                          ภาคการศึกษาที่ 2
                        </FieldLabel>
                      </Field>
                      <Field orientation="horizontal">
                        <RadioGroupItem value={"3"} id="semester3" />
                        <FieldLabel htmlFor="semester" className="font-normal">
                          ภาคฤดูร้อน
                        </FieldLabel>
                      </Field>
                    </div>
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="courseId">
                    รายละเอียด (ไม่บังคับ)
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="description"
                      placeholder="คำอธิบายรายวิชาสั้นๆ"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    {field.value.length} / 100 ตัวอักษร
                  </FieldDescription>
                </Field>
              )}
            />

            <FieldSet>
              <FieldLegend variant="label">อีเมล</FieldLegend>
              <FieldDescription>
                {fields.length}/{INSTRUCTOR_MAX} คน — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th (ห้ามซ้ำกัน)
              </FieldDescription>

              <FieldGroup className="gap-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-1.5 w-5 shrink-0 text-sm text-muted-foreground">
                      {index + 1}.
                    </span>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Controller
                        name={`instructors.${index}.name`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="flex-1">
                            <FieldContent>
                              <Input
                                {...field}
                                id={`instructor-email-${index}`}
                                placeholder="ชื่อผู้สอน"
                                aria-label={`ชื่อผู้สอนคนที่ ${index + 1}`}
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </FieldContent>
                          </Field>
                        )}
                      />
                      <Controller
                        name={`instructors.${index}.email`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="flex-1">
                            <FieldContent>
                              <Input
                                {...field}
                                id={`email-${index}`}
                                type="email"
                                placeholder="name@cmu.ac.th"
                                aria-label={`อีเมลของผู้สอนคนที่ที่ ${index + 1}`}
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </FieldContent>
                          </Field>
                        )}
                      />
                    </div>
                    {/* ─── remove(index) ─── */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`ลบผู้สอนคนที่ ${index + 1}`}
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </FieldGroup>

              {/* ─── Array Validation: error ระดับ array ─── */}
              {instructorsError?.message && <FieldError errors={[instructorsError]} />}

              {/* ─── append({...}) ─── */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={fields.length >= INSTRUCTOR_MAX}
                onClick={() => append({ name: "", email: "" })}
              >
                <Plus className="size-4" />
                เพิ่มผู้สอน
              </Button>
            </FieldSet>
            <Controller
              name="notifyByEmail"
              control={form.control}
              render={({ field }) => (
                <FieldLabel>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>รับข่าวสารทางอีเมล</FieldTitle>
                      <FieldDescription>
                        แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      name={field.name}
                      checked={!!field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        field.onBlur();
                      }}
                    />
                  </Field>
                </FieldLabel>
              )}
            />
          </FieldGroup>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างฟอร์ม
            </Button>
            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
