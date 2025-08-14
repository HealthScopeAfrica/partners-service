import { Schema, model, models, InferSchemaType } from "mongoose";

const SCOPES = ["content", "partners", "ads", "system"] as const;

const AdminProfileSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    scopes: { type: [String], enum: SCOPES, default: ["content"] },
  },
  { timestamps: true, versionKey: false }
);

AdminProfileSchema.index({ accountId: 1 }, { unique: true });

export type AdminProfile = InferSchemaType<typeof AdminProfileSchema>;
export const AdminProfileModel =
  models.AdminProfile || model("AdminProfile", AdminProfileSchema);
