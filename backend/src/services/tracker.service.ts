import Application from '../models/Application';

export const updateApplicationStatus = async (userId: string, opportunityId: string, status: string, notes?: string) => {
  const application = await Application.findOneAndUpdate(
    { userId, opportunityId },
    { status, ...(notes !== undefined && { notes }) },
    { new: true, upsert: true } // Upsert creates it if it doesn't exist
  );
  return application;
};

export const getUserApplications = async (userId: string) => {
  return await Application.find({ userId })
    .populate({
      path: 'opportunityId',
      select: '-rawExtract -dedupeKey'
    })
    .lean();
};
