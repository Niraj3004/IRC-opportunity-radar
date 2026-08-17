import Bookmark from '../models/Bookmark';

export const toggleBookmark = async (userId: string, opportunityId: string) => {
  const existing = await Bookmark.findOne({ userId, opportunityId });
  
  if (existing) {
    await existing.deleteOne();
    return { bookmarked: false, message: 'Bookmark removed' };
  } else {
    await Bookmark.create({ userId, opportunityId });
    return { bookmarked: true, message: 'Bookmark added' };
  }
};

export const getUserBookmarks = async (userId: string) => {
  return await Bookmark.find({ userId })
    .populate({
      path: 'opportunityId',
      match: { status: 'published' },
      select: '-rawExtract -dedupeKey'
    })
    .lean()
    .then(bookmarks => bookmarks.filter(b => b.opportunityId !== null));
};
