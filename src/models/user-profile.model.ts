import { Document, model, Model, Schema, Promise } from 'mongoose';
import * as EmailValidator from 'email-validator';
import * as mongoose from 'mongoose';

import { UserProfile } from '../../shared/models';

export interface IUserProfileModel extends UserProfile, Document {}

export const UserProfileSchema = new Schema({
  email: {
    unique: true,
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    validate: {
        validator: email => EmailValidator.validate(email),
        message: `{VALUE} is not a valid email`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

UserProfileSchema.methods.toJSON = function() {
  const instance = (this as IUserProfileModel).toObject();
  delete instance.password; // Remove the password field
  return instance;
};

export const UserProfileModel: Model<IUserProfileModel> = model<
  IUserProfileModel
>('user', UserProfileSchema);
