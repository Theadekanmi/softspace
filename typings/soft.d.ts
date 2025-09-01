
declare interface postType {
	addCommentToPost(postId: any, author: any, content: any): Promise<null>;

	addReplyToComment(postId: any, commentId: any, author: any, content: any): Promise<any>;

	editPost(postId: any, newContent: any): Promise<void>;

	editComment(postId: any, commentId: any, newContent: any): Promise<void>;

	editReply(postId: any, commentId: any, replyId: any, newContent: any): Promise<void>;

	deletePost(postId: any): Promise<void>;

	deleteComment(postId: any, commentId: any): Promise<void>;

	deleteReply(postId: any, commentId: any, replyId: any): Promise<void>;
}

declare interface newPostType {
	handleAuthCallback(then: any, session: any, if: any, session: any): void;
}
