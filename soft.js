// Social Media Platform for SoftSpace
class SocialMediaPlatform {
    constructor() {
        this.posts = this.loadPosts();
        this.currentEditPostId = null;
        this.currentEditCommentId = null;
        this.currentEditReplyId = null;
        this.currentReplyToCommentId = null;
        this.currentReplyToPostId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderPosts();
    }

    setupEventListeners() {
        // Create post form
        const createPostForm = document.getElementById('createPostForm');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => this.handleCreatePost(e));
        }

        // Post content character count
        const postContent = document.getElementById('postContent');
        if (postContent) {
            postContent.addEventListener('input', (e) => this.updatePostCharCount(e));
        }
    }

    handleCreatePost(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('posterName');
        const contentInput = document.getElementById('postContent');
        
        const name = nameInput.value.trim() || 'Anonymous';
        const content = contentInput.value.trim();
        
        if (!content) {
            this.showAlert('Please write something to create a post.', 'warning');
            return;
        }

        this.createPost(name, content);
        
        // Clear form
        nameInput.value = '';
        contentInput.value = '';
        this.updatePostCharCount({ target: contentInput });
        
        this.savePosts();
        this.renderPosts();
    }

    showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    // Automatically remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}
    createPost(name, content) {
        const post = {
            id: Date.now().toString(),
            author: name,
            content: content,
            timestamp: new Date().toISOString(),
            likes: 0,
            liked: false,
            comments: []
        };
        
        this.posts.unshift(post);
    }

    addCommentToPost(postId, author, content) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = {
                id: Date.now().toString(),
                author: author,
                content: content,
                timestamp: new Date().toISOString(),
                likes: 0,
                liked: false,
                replies: []
            };
            post.comments.push(comment);
        }
    }

    addReplyToComment(postId, commentId, author, content) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                const reply = {
                    id: Date.now().toString(),
                    author: author,
                    content: content,
                    timestamp: new Date().toISOString(),
                    likes: 0,
                    liked: false
                };
                comment.replies.push(reply);
            }
        }
    }

    editPost(postId, newContent) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.content = newContent;
            post.edited = true;
            post.editTimestamp = new Date().toISOString();
        }
    }

    editComment(postId, commentId, newContent) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                comment.content = newContent;
                comment.edited = true;
                comment.editTimestamp = new Date().toISOString();
            }
        }
    }

    editReply(postId, commentId, replyId, newContent) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                const reply = comment.replies.find(r => r.id === replyId);
                if (reply) {
                    reply.content = newContent;
                    reply.edited = true;
                    reply.editTimestamp = new Date().toISOString();
                }
            }
        }
    }

    deletePost(postId) {
        this.posts = this.posts.filter(p => p.id !== postId);
    }

    deleteComment(postId, commentId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.comments = post.comments.filter(c => c.id !== commentId);
        }
    }

    deleteReply(postId, commentId, replyId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                comment.replies = comment.replies.filter(r => r.id !== replyId);
            }
        }
    }

    togglePostLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (post.liked) {
                post.likes--;
                post.liked = false;
            } else {
                post.likes++;
                post.liked = true;
            }
            this.savePosts();
            this.renderPosts();
        }
    }

    toggleCommentLike(postId, commentId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                if (comment.liked) {
                    comment.likes--;
                    comment.liked = false;
                } else {
                    comment.likes++;
                    comment.liked = true;
                }
                this.savePosts();
                this.renderPosts();
            }
        }
    }

    toggleReplyLike(postId, commentId, replyId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                const reply = comment.replies.find(r => r.id === replyId);
                if (reply) {
                    if (reply.liked) {
                        reply.likes--;
                        reply.liked = false;
                    } else {
                        reply.likes++;
                        reply.liked = true;
                    }
                    this.savePosts();
                    this.renderPosts();
                }
            }
        }
    }

    startEditPost(postId) {
        this.currentEditPostId = postId;
        this.currentEditCommentId = null;
        this.currentEditReplyId = null;
        
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            document.getElementById('postContent').value = post.content;
            document.getElementById('postContent').focus();
            
            const submitBtn = document.querySelector('#createPostForm button[type="submit"]');
            submitBtn.textContent = 'Update Post';
        }
    }

    startEditComment(postId, commentId) {
        this.currentEditCommentId = commentId;
        this.currentEditPostId = null;
        this.currentEditReplyId = null;
        
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                // Find the comment input field and populate it
                const commentInput = document.querySelector(`[data-comment-id="${commentId}"] .comment-edit-input`);
                if (commentInput) {
                    commentInput.value = comment.content;
                    commentInput.style.display = 'block';
                    commentInput.focus();
                    
                    // Show update button
                    const updateBtn = commentInput.parentNode.querySelector('.comment-update-btn');
                    if (updateBtn) updateBtn.style.display = 'inline-block';
                }
            }
        }
    }

    startEditReply(postId, commentId, replyId) {
        this.currentEditReplyId = replyId;
        this.currentEditPostId = null;
        this.currentEditCommentId = null;
        
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const comment = post.comments.find(c => c.id === commentId);
            if (comment) {
                const reply = comment.replies.find(r => r.id === replyId);
                if (reply) {
                    // Find the reply input field and populate it
                    const replyInput = document.querySelector(`[data-reply-id="${replyId}"] .reply-edit-input`);
                    if (replyInput) {
                        replyInput.value = reply.content;
                        replyInput.style.display = 'block';
                        replyInput.focus();
                        
                        // Show update button
                        const updateBtn = replyInput.parentNode.querySelector('.reply-update-btn');
                        if (updateBtn) updateBtn.style.display = 'inline-block';
                    }
                }
            }
        }
    }

    startReplyToPost(postId) {
        this.currentReplyToPostId = postId;
        this.currentReplyToCommentId = null;
        
        // Find the comment input field for this post and focus it
        const commentInput = document.querySelector(`[data-post-id="${postId}"] .post-comment-input`);
        if (commentInput) {
            commentInput.focus();
        }
    }

    startReplyToComment(postId, commentId) {
        this.currentReplyToCommentId = commentId;
        this.currentReplyToPostId = null;
        
        // Find the reply input field for this comment and focus it
        const replyInput = document.querySelector(`[data-comment-id="${commentId}"] .comment-reply-input`);
        if (replyInput) {
            replyInput.style.display = 'block';
            replyInput.focus();
        }
    }

    cancelEdit() {
        this.currentEditPostId = null;
        this.currentEditCommentId = null;
        this.currentEditReplyId = null;
        
        document.getElementById('postContent').value = '';
        document.getElementById('posterName').value = '';
        
        const submitBtn = document.querySelector('#createPostForm button[type="submit"]');
        submitBtn.textContent = 'Create Post';
        
        this.updatePostCharCount({ target: document.getElementById('postContent') });
        
        // Hide all edit inputs
        document.querySelectorAll('.comment-edit-input, .reply-edit-input').forEach(input => {
            input.style.display = 'none';
        });
        
        // Hide all update buttons
        document.querySelectorAll('.comment-update-btn, .reply-update-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    }

    renderPosts() {
        const postsFeed = document.getElementById('postsFeed');
        const noPosts = document.getElementById('noPosts');
        
        if (!postsFeed) return;

        if (this.posts.length === 0) {
            postsFeed.innerHTML = '';
            noPosts.style.display = 'block';
            return;
        }

        noPosts.style.display = 'none';
        
        postsFeed.innerHTML = this.posts.map(post => this.renderPost(post)).join('');
        
        // Add event listeners to new post elements
        this.addPostEventListeners();
    }

    renderPost(post) {
        const editStatus = post.edited ? '<small class="text-muted ms-2">(edited)</small>' : '';
        const likeIcon = post.liked ? 'fas fa-heart text-danger' : 'far fa-heart';
        
        return `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-meta">
                        <span class="post-author fw-bold">${this.escapeHtml(post.author)}</span>
                        <span class="post-date text-muted">${this.formatDate(post.timestamp)}</span>
                        ${editStatus}
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-sm btn-outline-secondary edit-post-btn" title="Edit Post">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-post-btn" title="Delete Post">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="post-content">
                    <p class="post-text">${this.escapeHtml(post.content)}</p>
                </div>
                
                <div class="post-footer">
                    <button class="btn btn-sm btn-outline-primary like-post-btn" title="Like Post">
                        <i class="${likeIcon}"></i>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary reply-to-post-btn" title="Comment on this post">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                </div>
                
                <!-- Comment Section for this Post -->
                <div class="post-comments">
                    <h6 class="comments-title">Comments (${post.comments.length})</h6>
                    
                    <!-- Add Comment to this Post -->
                    <div class="add-comment-container">
                        <input type="text" class="form-control post-comment-input" placeholder="Write a comment..." maxlength="300">
                        <div class="comment-actions mt-2">
                            <button class="btn btn-sm btn-primary post-comment-btn">Post Comment</button>
                        </div>
                    </div>
                    
                    <!-- Comments List -->
                    <div class="comments-list">
                        ${post.comments.map(comment => this.renderComment(comment, post.id)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderComment(comment, postId) {
        const editStatus = comment.edited ? '<small class="text-muted ms-2">(edited)</small>' : '';
        const likeIcon = comment.liked ? 'fas fa-heart text-danger' : 'far fa-heart';
        
        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-meta">
                        <span class="comment-author fw-bold">${this.escapeHtml(comment.author)}</span>
                        <span class="comment-date text-muted">${this.formatDate(comment.timestamp)}</span>
                        ${editStatus}
                    </div>
                    <div class="comment-actions">
                        <button class="btn btn-sm btn-outline-secondary edit-comment-btn" title="Edit Comment">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-comment-btn" title="Delete Comment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="comment-content">
                    <p class="comment-text">${this.escapeHtml(comment.content)}</p>
                    
                    <!-- Edit Comment Input (hidden by default) -->
                    <div class="comment-edit-container" style="display: none;">
                        <textarea class="form-control comment-edit-input" rows="2" maxlength="300">${this.escapeHtml(comment.content)}</textarea>
                        <div class="comment-edit-actions mt-2">
                            <button class="btn btn-sm btn-primary comment-update-btn">Update</button>
                            <button class="btn btn-sm btn-outline-secondary comment-cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <div class="comment-footer">
                    <button class="btn btn-sm btn-outline-primary like-comment-btn" title="Like Comment">
                        <i class="${likeIcon}"></i>
                        <span class="like-count">${comment.likes}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary reply-to-comment-btn" title="Reply to this comment">
                        <i class="fas fa-reply"></i>
                        <span>Reply</span>
                    </button>
                </div>
                
                <!-- Reply Section for this Comment -->
                <div class="comment-replies">
                    <h6 class="replies-title">Replies (${comment.replies.length})</h6>
                    
                    <!-- Add Reply to this Comment -->
                    <div class="add-reply-container" style="display: none;">
                        <input type="text" class="form-control comment-reply-input" placeholder="Write a reply..." maxlength="200">
                        <div class="reply-actions mt-2">
                            <button class="btn btn-sm btn-primary post-reply-btn">Post Reply</button>
                        </div>
                    </div>
                    
                    <!-- Replies List -->
                    <div class="replies-list">
                        ${comment.replies.map(reply => this.renderReply(reply, postId, comment.id)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderReply(reply, postId, commentId) {
        const editStatus = reply.edited ? '<small class="text-muted ms-2">(edited)</small>' : '';
        const likeIcon = reply.liked ? 'fas fa-heart text-danger' : 'far fa-heart';
        
        return `
            <div class="reply-item" data-reply-id="${reply.id}" data-comment-id="${commentId}" data-post-id="${postId}">
                <div class="reply-header">
                    <div class="reply-meta">
                        <span class="reply-author fw-bold">${this.escapeHtml(reply.author)}</span>
                        <span class="reply-date text-muted">${this.formatDate(reply.timestamp)}</span>
                        ${editStatus}
                    </div>
                    <div class="reply-actions">
                        <button class="btn btn-sm btn-outline-secondary edit-reply-btn" title="Edit Reply">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-reply-btn" title="Delete Reply">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="reply-content">
                    <p class="reply-text">${this.escapeHtml(reply.content)}</p>
                    
                    <!-- Edit Reply Input (hidden by default) -->
                    <div class="reply-edit-container" style="display: none;">
                        <textarea class="form-control reply-edit-input" rows="2" maxlength="200">${this.escapeHtml(reply.content)}</textarea>
                        <div class="reply-edit-actions mt-2">
                            <button class="btn btn-sm btn-primary reply-update-btn">Update</button>
                            <button class="btn btn-sm btn-outline-secondary reply-cancel-btn">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <div class="reply-footer">
                    <button class="btn btn-sm btn-outline-primary like-reply-btn" title="Like Reply">
                        <i class="${likeIcon}"></i>
                        <span class="like-count">${reply.likes}</span>
                    </button>
                </div>
            </div>
        `;
    }

    addPostEventListeners() {
        // Like post buttons
        document.querySelectorAll('.like-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post-item').dataset.postId;
                this.togglePostLike(postId);
            });
        });

        // Edit post buttons
        document.querySelectorAll('.edit-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post-item').dataset.postId;
                this.startEditPost(postId);
            });
        });

            // Delete post buttons
            document.querySelectorAll('.delete-post-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const postId = e.target.closest('.post-item').dataset.postId;
                    this.deletePost(postId);
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Post deleted successfully!', 'success');
                });
            });

        // Reply to post buttons
        document.querySelectorAll('.reply-to-post-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post-item').dataset.postId;
                this.startReplyToPost(postId);
            });
        });

        // Post comment buttons
        document.querySelectorAll('.post-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postItem = e.target.closest('.post-item');
                const postId = postItem.dataset.postId;
                const commentInput = postItem.querySelector('.post-comment-input');
                const content = commentInput.value.trim();
                
                if (content) {
                    this.addCommentToPost(postId, 'Anonymous', content);
                    commentInput.value = '';
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Comment posted successfully!', 'success');
                }
            });
        });

        // Like comment buttons
        document.querySelectorAll('.like-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem.dataset.commentId;
                const postId = commentItem.closest('.post-item').dataset.postId;
                this.toggleCommentLike(postId, commentId);
            });
        });

        // Edit comment buttons
        document.querySelectorAll('.edit-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem.dataset.commentId;
                const postId = commentItem.closest('.post-item').dataset.postId;
                this.startEditComment(postId, commentId);
            });
        });

            // Delete comment buttons
            document.querySelectorAll('.delete-comment-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const commentItem = e.target.closest('.comment-item');
                    const commentId = commentItem.dataset.commentId;
                    const postId = commentItem.closest('.post-item').dataset.postId;
                    this.deleteComment(postId, commentId);
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Comment deleted successfully!', 'success');
                });
            });

        // Reply to comment buttons
        document.querySelectorAll('.reply-to-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem.dataset.commentId;
                const postId = commentItem.closest('.post-item').dataset.postId;
                this.startReplyToComment(postId, commentId);
            });
        });

        // Post reply buttons
        document.querySelectorAll('.post-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem.dataset.commentId;
                const postId = commentItem.closest('.post-item').dataset.postId;
                const replyInput = commentItem.querySelector('.comment-reply-input');
                const content = replyInput.value.trim();
                
                if (content) {
                    this.addReplyToComment(postId, commentId, 'Anonymous', content);
                    replyInput.value = '';
                    replyInput.style.display = 'none';
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Reply posted successfully!', 'success');
                }
            });
        });

        // Like reply buttons
        document.querySelectorAll('.like-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const replyItem = e.target.closest('.reply-item');
                const replyId = replyItem.dataset.replyId;
                const commentId = replyItem.dataset.commentId;
                const postId = replyItem.dataset.postId;
                this.toggleReplyLike(postId, commentId, replyId);
            });
        });

        // Edit reply buttons
        document.querySelectorAll('.edit-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const replyItem = e.target.closest('.reply-item');
                const replyId = replyItem.dataset.replyId;
                const commentId = replyItem.dataset.commentId;
                const postId = replyItem.dataset.postId;
                this.startEditReply(postId, commentId, replyId);
            });
        });

            // Delete reply buttons
            document.querySelectorAll('.delete-reply-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const replyItem = e.target.closest('.reply-item');
                    const replyId = replyItem.dataset.replyId;
                    const commentId = replyItem.dataset.commentId;
                    const postId = replyItem.dataset.postId;
                    this.deleteReply(postId, commentId, replyId);
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Reply deleted successfully!', 'success');
                });
            });

        // Update comment buttons
        document.querySelectorAll('.comment-update-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const commentId = commentItem.dataset.commentId;
                const postId = commentItem.closest('.post-item').dataset.postId;
                const editInput = commentItem.querySelector('.comment-edit-input');
                const newContent = editInput.value.trim();
                
                if (newContent) {
                    this.editComment(postId, commentId, newContent);
                    editInput.style.display = 'none';
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Comment updated successfully!', 'success');
                }
            });
        });

        // Update reply buttons
        document.querySelectorAll('.reply-update-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const replyItem = e.target.closest('.reply-item');
                const replyId = replyItem.dataset.replyId;
                const commentId = replyItem.dataset.commentId;
                const postId = replyItem.dataset.postId;
                const editInput = replyItem.querySelector('.reply-edit-input');
                const newContent = editInput.value.trim();
                
                if (newContent) {
                    this.editReply(postId, commentId, replyId, newContent);
                    editInput.style.display = 'none';
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Reply updated successfully!', 'success');
                }
            });
        });

        // Cancel edit buttons
        document.querySelectorAll('.comment-cancel-btn, .reply-cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const editContainer = e.target.closest('.comment-edit-container, .reply-edit-container');
                editContainer.style.display = 'none';
            });
        });
    }

    updatePostCharCount(e) {
        const charCount = document.getElementById('postCharCount');
        if (charCount) {
            charCount.textContent = e.target.value.length;
        }
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const communitySection = document.getElementById('community');
        if (communitySection) {
            communitySection.insertBefore(alertDiv, communitySection.firstChild);
            
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    savePosts() {
        localStorage.setItem('softspace-posts', JSON.stringify(this.posts));
    }

    loadPosts() {
        const saved = localStorage.getItem('softspace-posts');
        return saved ? JSON.parse(saved) : [];
    }
}

// Add cancel button to the create post form
document.addEventListener('DOMContentLoaded', function() {
    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        const submitBtn = createPostForm.querySelector('button[type="submit"]');
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-outline-secondary ms-2';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            window.socialPlatform.cancelEdit();
        });
        
        submitBtn.parentNode.appendChild(cancelBtn);
        cancelBtn.style.display = 'none';
        
        // Show/hide cancel button based on edit state
        const observer = new MutationObserver(() => {
            const isEditing = window.socialPlatform.currentEditPostId;
            cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
        });
        
        observer.observe(createPostForm, { childList: true, subtree: true });
    }
    
    // Initialize social media platform
    window.socialPlatform = new SocialMediaPlatform();
});

// Article COMMENT SECTION
document.addEventListener("DOMContentLoaded", () => {

  class CommentSystem {
    constructor(section) {
      this.section = section;
      this.articleId = section.dataset.articleId;
      this.commentsKey = `comments_article_${this.articleId}`;
      this.likesKey = `likes_article_${this.articleId}`;

      this.textarea = this.section.querySelector(".comment-input");
      this.postBtn = this.section.querySelector(".post-btn");
      this.likeBtn = this.section.querySelector(".like-btn");

      this.commentsContainer = document.createElement("div");
      this.commentsContainer.classList.add("comments-container");
      this.section.appendChild(this.commentsContainer);

      this.comments = JSON.parse(localStorage.getItem(this.commentsKey)) || [];
      this.likes = parseInt(localStorage.getItem(this.likesKey)) || 0;
      this.updateLikeDisplay();

      this.init();
      this.renderComments();
    }

    init() {
      // Like button
      this.likeBtn.addEventListener("click", () => {
        if (!this.likeBtn.classList.contains("liked")) {
          this.likes++;
          this.likeBtn.classList.add("liked");
          this.updateLikeDisplay();
          localStorage.setItem(this.likesKey, this.likes);
        }
      });

      // Post button
      this.postBtn.addEventListener("click", () => {
        const text = this.textarea.value.trim();
        if (text) {
          this.addComment(text);
          this.textarea.value = "";
        }
      });

      // Close menus when clicking outside
      document.addEventListener("click", (e) => {
        this.commentsContainer.querySelectorAll(".menu-div").forEach((menuDiv) => {
          const moreBtn = menuDiv.previousElementSibling;
          if (!menuDiv.contains(e.target) && (!moreBtn || !moreBtn.contains(e.target))) {
            menuDiv.style.display = "none";
          }
        });
      });
    }

    updateLikeDisplay() {
      const span = this.likeBtn.querySelector("span");
      if (span) span.textContent = this.likes;
    }

    addComment(text) {
      const comment = { id: Date.now() + Math.random(), text };
      this.comments.push(comment);
      this.saveComments();
      this.renderComments();
    }

    editComment(id, newText) {
      const comment = this.comments.find(c => c.id === id);
      if (comment) {
        comment.text = newText;
        this.saveComments();
        this.renderComments();
      }
    }

    deleteComment(id) {
      this.comments = this.comments.filter(c => c.id !== id);
      this.saveComments();
      this.renderComments();
    }

    saveComments() {
      localStorage.setItem(this.commentsKey, JSON.stringify(this.comments));
    }

    renderComments() {
      this.commentsContainer.innerHTML = "";

      this.comments.forEach((comment) => {
        const div = document.createElement("div");
        div.classList.add("comment");
        div.dataset.id = comment.id;

        // Text
        const textP = document.createElement("p");
        textP.textContent = comment.text;

        // Actions
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("comment-actions");

        // More button
        const moreBtn = document.createElement("button");
        moreBtn.textContent = "⋮";
        moreBtn.classList.add("more-btn");

        // Menu
        const menuDiv = document.createElement("div");
        menuDiv.classList.add("menu-div");
        menuDiv.style.display = "none";

        const menuButtonsWrapper = document.createElement("div");
        menuButtonsWrapper.classList.add("menu-buttons-wrapper");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");

        menuButtonsWrapper.appendChild(editBtn);
        menuButtonsWrapper.appendChild(deleteBtn);
        menuDiv.appendChild(menuButtonsWrapper);

        actionsDiv.appendChild(moreBtn);
        actionsDiv.appendChild(menuDiv);
        div.appendChild(textP);
        div.appendChild(actionsDiv);

        // Toggle menu
        moreBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          menuDiv.style.display = menuDiv.style.display === "none" ? "flex" : "none";
        });

        // Edit
        editBtn.addEventListener("click", () => {
          const editBox = document.createElement("textarea");
          editBox.value = comment.text;
          editBox.classList.add("comment-edit-textarea");

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "Save";
          saveBtn.classList.add("save-btn");

          const cancelBtn = document.createElement("button");
          cancelBtn.textContent = "Cancel";
          cancelBtn.classList.add("cancel-btn");

          div.replaceChild(editBox, textP);

          const editActionsWrapper = document.createElement("div");
          editActionsWrapper.classList.add("comment-edit-actions");
          editActionsWrapper.appendChild(saveBtn);
          editActionsWrapper.appendChild(cancelBtn);

          actionsDiv.innerHTML = "";
          actionsDiv.appendChild(editActionsWrapper);

          saveBtn.addEventListener("click", () => {
            const newText = editBox.value.trim();
            if (newText) this.editComment(comment.id, newText);
            else this.renderComments();
          });

          cancelBtn.addEventListener("click", () => this.renderComments());
        });

        // Delete
        deleteBtn.addEventListener("click", () => this.deleteComment(comment.id));

        this.commentsContainer.appendChild(div);
      });
    }
  }

  // Initialize for all comment sections
  document.querySelectorAll(".comment-section").forEach((section) => {
    new CommentSystem(section);
  });

});

// Article COMMENT SECTION 