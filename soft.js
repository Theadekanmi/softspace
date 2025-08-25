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

        // Check if we're editing an existing post
        if (this.currentEditPostId) {
            this.editPost(this.currentEditPostId, content);
            this.currentEditPostId = null;
            const submitBtn = document.querySelector('#createPostForm button[type="submit"]');
            submitBtn.textContent = 'Create Post';
            this.showAlert('Post updated successfully!', 'success');
        } else {
            this.createPost(name, content);
            this.showAlert('Post created successfully!', 'success');
        }
        
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
        
        // Style the alert
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            color: white;
            font-weight: 500;
            min-width: 250px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set color based on type
        if (type === 'success') {
            alertDiv.style.backgroundColor = '#10B981';
        } else if (type === 'warning') {
            alertDiv.style.backgroundColor = '#F59E0B';
        } else {
            alertDiv.style.backgroundColor = '#3B82F6';
        }
        
        document.body.appendChild(alertDiv);
        
        // Animate in
        setTimeout(() => {
            alertDiv.style.transform = 'translateX(0)';
        }, 100);

        // Automatically remove alert after 4 seconds
        setTimeout(() => {
            alertDiv.style.transform = 'translateX(100%)';
            setTimeout(() => alertDiv.remove(), 300);
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
                id: Date.now().toString() + Math.random(),
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
                    id: Date.now().toString() + Math.random(),
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

    toggleCommentsVisibility(postId) {
        const commentsList = document.querySelector(`[data-post-id="${postId}"] .comments-list`);
        const toggleBtn = document.querySelector(`[data-post-id="${postId}"] .comments-toggle-btn`);
        
        if (commentsList && toggleBtn) {
            const isHidden = commentsList.style.display === 'none';
            commentsList.style.display = isHidden ? 'block' : 'none';
            const post = this.posts.find(p => p.id === postId);
            const commentCount = post ? post.comments.length : 0;
            toggleBtn.textContent = isHidden ? `Hide Comments (${commentCount})` : `Comments (${commentCount})`;
        }
    }

    toggleRepliesVisibility(commentId) {
        const repliesList = document.querySelector(`[data-comment-id="${commentId}"] .replies-list`);
        const toggleBtn = document.querySelector(`[data-comment-id="${commentId}"] .replies-toggle-btn`);
        
        if (repliesList && toggleBtn) {
            const isHidden = repliesList.style.display === 'none';
            repliesList.style.display = isHidden ? 'block' : 'none';
            const replyCount = repliesList.querySelectorAll('.reply-item').length;
            toggleBtn.textContent = isHidden ? `Hide Replies (${replyCount})` : `Replies (${replyCount})`;
        }
    }

    // Show comment input only when Comment button is clicked
    showCommentInput(postId) {
        const postItem = document.querySelector(`[data-post-id="${postId}"]`);
        const addCommentContainer = postItem.querySelector('.add-comment-container');
        const commentInput = postItem.querySelector('.post-comment-input');
        
        if (addCommentContainer && commentInput) {
            addCommentContainer.style.display = 'block';
            commentInput.focus();
        }
    }

    // Hide comment input after posting
    hideCommentInput(postId) {
        const postItem = document.querySelector(`[data-post-id="${postId}"]`);
        const addCommentContainer = postItem.querySelector('.add-comment-container');
        
        if (addCommentContainer) {
            addCommentContainer.style.display = 'none';
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
        const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
        const commentText = commentItem.querySelector('.comment-text');
        const editContainer = commentItem.querySelector('.comment-edit-container');
        const editTextarea = commentItem.querySelector('.comment-edit-input');
        
        const post = this.posts.find(p => p.id === postId);
        const comment = post ? post.comments.find(c => c.id === commentId) : null;
        
        if (comment && commentText && editContainer && editTextarea) {
            commentText.style.display = 'none';
            editContainer.style.display = 'block';
            editTextarea.value = comment.content;
            editTextarea.focus();
        }
    }

    startEditReply(postId, commentId, replyId) {
        const replyItem = document.querySelector(`[data-reply-id="${replyId}"]`);
        const replyText = replyItem.querySelector('.reply-text');
        const editContainer = replyItem.querySelector('.reply-edit-container');
        const editTextarea = replyItem.querySelector('.reply-edit-input');
        
        const post = this.posts.find(p => p.id === postId);
        const comment = post ? post.comments.find(c => c.id === commentId) : null;
        const reply = comment ? comment.replies.find(r => r.id === replyId) : null;
        
        if (reply && replyText && editContainer && editTextarea) {
            replyText.style.display = 'none';
            editContainer.style.display = 'block';
            editTextarea.value = reply.content;
            editTextarea.focus();
        }
    }

    startReplyToComment(postId, commentId) {
        const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
        const addReplyContainer = commentItem.querySelector('.add-reply-container');
        const replyInput = commentItem.querySelector('.comment-reply-input');
        
        if (addReplyContainer && replyInput) {
            addReplyContainer.style.display = 'block';
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
        document.querySelectorAll('.comment-edit-container, .reply-edit-container').forEach(container => {
            container.style.display = 'none';
        });
        
        // Show all comment/reply texts
        document.querySelectorAll('.comment-text, .reply-text').forEach(text => {
            text.style.display = 'block';
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
            <div class="post-item" data-post-id="${post.id}" style="
                background: linear-gradient(145deg, #ffffff, #f8f9ff);
                border: 1px solid #e1e8f7;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                transition: all 0.3s ease;
            ">
                <div class="post-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                ">
                    <div class="post-meta">
                        <span class="post-author fw-bold" style="
                            color: #2d3748;
                            font-size: 16px;
                        ">${this.escapeHtml(post.author)}</span>
                        <span class="post-date text-muted" style="
                            margin-left: 12px;
                            color: #718096;
                            font-size: 14px;
                        ">${this.formatDate(post.timestamp)}</span>
                        ${editStatus}
                    </div>
                    <div class="post-actions" style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-outline-secondary edit-post-btn" title="Edit Post" style="
                            border: 1px solid #e2e8f0;
                            background: white;
                            border-radius: 8px;
                            padding: 6px 10px;
                            transition: all 0.2s ease;
                        ">
                            <i class="fas fa-edit" style="color: #4a5568;"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-post-btn" title="Delete Post" style="
                            border: 1px solid #fed7d7;
                            background: white;
                            border-radius: 8px;
                            padding: 6px 10px;
                            transition: all 0.2s ease;
                        ">
                            <i class="fas fa-trash" style="color: #e53e3e;"></i>
                        </button>
                    </div>
                </div>
                
                <div class="post-content" style="margin-bottom: 20px;">
                    <p class="post-text" style="
                        color: #2d3748;
                        line-height: 1.6;
                        font-size: 15px;
                        margin: 0;
                    ">${this.escapeHtml(post.content)}</p>
                </div>
                
                <div class="post-footer" style="
                    display: flex;
                    gap: 12px;
                    padding-top: 16px;
                    border-top: 1px solid #e2e8f0;
                ">
                    <button class="btn btn-sm btn-outline-primary like-post-btn" title="Like Post" style="
                        border: 1px solid #3182ce;
                        background: ${post.liked ? '#3182ce' : 'white'};
                        color: ${post.liked ? 'white' : '#3182ce'};
                        border-radius: 20px;
                        padding: 6px 16px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        transition: all 0.2s ease;
                    ">
                        <i class="${likeIcon}"></i>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary comment-btn" title="Comment on this post" style="
                        border: 1px solid #a0aec0;
                        background: white;
                        color: #4a5568;
                        border-radius: 20px;
                        padding: 6px 16px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-comment"></i>
                        <span>Comment</span>
                    </button>
                </div>
                
                <!-- Comment Section for this Post -->
                <div class="post-comments" style="margin-top: 20px;">
                    <div class="comments-header">
                        <button class="btn btn-sm btn-link comments-toggle-btn" style="
                            padding: 0;
                            text-decoration: none;
                            color: #4a5568;
                            font-weight: 500;
                            border: none;
                            background: none;
                        ">
                            Comments (${post.comments.length})
                        </button>
                    </div>
                    
                    <!-- Add Comment to this Post (Hidden by default) -->
                    <div class="add-comment-container" style="
                        display: none;
                        margin: 16px 0;
                        background: #f7fafc;
                        border-radius: 12px;
                        padding: 16px;
                        border: 1px solid #e2e8f0;
                    ">
                        <input type="text" class="form-control post-comment-input" placeholder="Write a comment..." maxlength="300" style="
                            border: 2px solid #e2e8f0;
                            border-radius: 25px;
                            padding: 12px 20px;
                            font-size: 14px;
                            background: white;
                            transition: all 0.2s ease;
                            margin-bottom: 12px;
                        ">
                        <div class="comment-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
                            <button class="btn btn-sm btn-outline-secondary cancel-comment-btn" style="
                                border-radius: 20px;
                                padding: 6px 16px;
                                border: 1px solid #cbd5e0;
                            ">Cancel</button>
                            <button class="btn btn-sm btn-primary post-comment-btn" style="
                                border-radius: 20px;
                                padding: 6px 16px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                border: none;
                            ">Post Comment</button>
                        </div>
                    </div>
                    
                    <!-- Comments List -->
                    <div class="comments-list" style="display: none; margin-top: 16px;">
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
            <div class="comment-item" data-comment-id="${comment.id}" style="
                background: white;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                border: 1px solid #f0f0f0;
                position: relative;
            ">
                <!-- Comment Actions (Top Right) -->
                <div class="comment-actions" style="
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    display: flex;
                    gap: 4px;
                ">
                    <button class="btn btn-sm edit-comment-btn" title="Edit Comment" style="
                        background: rgba(74, 85, 104, 0.1);
                        border: none;
                        border-radius: 6px;
                        padding: 4px 8px;
                        color: #4a5568;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm delete-comment-btn" title="Delete Comment" style="
                        background: rgba(229, 62, 62, 0.1);
                        border: none;
                        border-radius: 6px;
                        padding: 4px 8px;
                        color: #e53e3e;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <div class="comment-header" style="margin-bottom: 8px; padding-right: 60px;">
                    <div class="comment-meta">
                        <span class="comment-author fw-bold" style="
                            color: #2d3748;
                            font-size: 14px;
                        ">${this.escapeHtml(comment.author)}</span>
                        <span class="comment-date text-muted" style="
                            margin-left: 8px;
                            color: #718096;
                            font-size: 12px;
                        ">${this.formatDate(comment.timestamp)}</span>
                        ${editStatus}
                    </div>
                </div>
                
                <div class="comment-content">
                    <p class="comment-text" style="
                        color: #4a5568;
                        line-height: 1.5;
                        font-size: 14px;
                        margin: 0 0 12px 0;
                    ">${this.escapeHtml(comment.content)}</p>
                    
                    <!-- Edit Comment Input (hidden by default) -->
                    <div class="comment-edit-container" style="display: none;">
                        <textarea class="form-control comment-edit-input" rows="2" maxlength="300" style="
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 10px;
                            font-size: 14px;
                            resize: none;
                            margin-bottom: 8px;
                        ">${this.escapeHtml(comment.content)}</textarea>
                        <div class="comment-edit-actions" style="display: flex; gap: 8px; justify-content: flex-end;">
                            <button class="btn btn-sm btn-outline-secondary comment-cancel-btn" style="
                                border-radius: 16px;
                                padding: 4px 12px;
                                font-size: 12px;
                            ">Cancel</button>
                            <button class="btn btn-sm btn-primary comment-update-btn" style="
                                border-radius: 16px;
                                padding: 4px 12px;
                                font-size: 12px;
                                background: #4299e1;
                                border: none;
                            ">Update</button>
                        </div>
                    </div>
                </div>
                
                <div class="comment-footer" style="display: flex; gap: 8px;">
                    <button class="btn btn-sm btn-outline-primary like-comment-btn" title="Like Comment" style="
                        border: 1px solid #3182ce;
                        background: ${comment.liked ? '#3182ce' : 'white'};
                        color: ${comment.liked ? 'white' : '#3182ce'};
                        border-radius: 16px;
                        padding: 4px 12px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 12px;
                    ">
                        <i class="${likeIcon}"></i>
                        <span class="like-count">${comment.likes}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary reply-to-comment-btn" title="Reply to this comment" style="
                        border: 1px solid #a0aec0;
                        background: white;
                        color: #4a5568;
                        border-radius: 16px;
                        padding: 4px 12px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 12px;
                    ">
                        <i class="fas fa-reply"></i>
                        <span>Reply</span>
                    </button>
                </div>
                
                <!-- Reply Section for this Comment -->
                <div class="comment-replies" style="margin-top: 12px;">
                    <div class="replies-header">
                        <button class="btn btn-sm btn-link replies-toggle-btn" style="
                            padding: 0;
                            text-decoration: none;
                            color: #4a5568;
                            font-weight: 500;
                            border: none;
                            background: none;
                            font-size: 12px;
                        ">
                            Replies (${comment.replies.length})
                        </button>
                    </div>
                    
                    <!-- Add Reply to this Comment -->
                    <div class="add-reply-container" style="
                        display: none;
                        margin: 12px 0;
                        background: #f7fafc;
                        border-radius: 8px;
                        padding: 12px;
                        border: 1px solid #e2e8f0;
                    ">
                        <input type="text" class="form-control comment-reply-input" placeholder="Write a reply..." maxlength="200" style="
                            border: 2px solid #e2e8f0;
                            border-radius: 20px;
                            padding: 8px 16px;
                            font-size: 12px;
                            background: white;
                            margin-bottom: 8px;
                        ">
                        <div class="reply-actions" style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-sm btn-outline-secondary cancel-reply-btn" style="
                                border-radius: 16px;
                                padding: 4px 12px;
                                font-size: 11px;
                            ">Cancel</button>
                            <button class="btn btn-sm btn-primary post-reply-btn" style="
                                border-radius: 16px;
                                padding: 4px 12px;
                                font-size: 11px;
                                background: #4299e1;
                                border: none;
                            ">Post Reply</button>
                        </div>
                    </div>
                    
                    <!-- Replies List -->
                    <div class="replies-list" style="display: none; margin-top: 8px; margin-left: 20px;">
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
            <div class="reply-item" data-reply-id="${reply.id}" data-comment-id="${commentId}" data-post-id="${postId}" style="
                background: white;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                border: 1px solid #f7fafc;
                position: relative;
            ">
                <!-- Reply Actions (Top Right) -->
                <div class="reply-actions" style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    display: flex;
                    gap: 4px;
                ">
                    <button class="btn btn-sm edit-reply-btn" title="Edit Reply" style="
                        background: rgba(74, 85, 104, 0.1);
                        border: none;
                        border-radius: 4px;
                        padding: 2px 6px;
                        color: #4a5568;
                        font-size: 10px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm delete-reply-btn" title="Delete Reply" style="
                        background: rgba(229, 62, 62, 0.1);
                        border: none;
                        border-radius: 4px;
                        padding: 2px 6px;
                        color: #e53e3e;
                        font-size: 10px;
                        transition: all 0.2s ease;
                    ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

                <div class="reply-header" style="margin-bottom: 6px; padding-right: 50px;">
                    <div class="reply-meta">
                        <span class="reply-author fw-bold" style="
                            color: #2d3748;
                            font-size: 12px;
                        ">${this.escapeHtml(reply.author)}</span>
                        <span class="reply-date text-muted" style="
                            margin-left: 6px;
                            color: #718096;
                            font-size: 10px;
                        ">${this.formatDate(reply.timestamp)}</span>
                        ${editStatus}
                    </div>
                </div>
                
                <div class="reply-content">
                    <p class="reply-text" style="
                        color: #4a5568;
                        line-height: 1.4;
                        font-size: 12px;
                        margin: 0 0 8px 0;
                    ">${this.escapeHtml(reply.content)}</p>
                    
                    <!-- Edit Reply Input (hidden by default) -->
                    <div class="reply-edit-container" style="display: none;">
                        <textarea class="form-control reply-edit-input" rows="2" maxlength="200" style="
                            border: 2px solid #e2e8f0;
                            border-radius: 6px;
                            padding: 8px;
                            font-size: 12px;
                            resize: none;
                            margin-bottom: 6px;
                        ">${this.escapeHtml(reply.content)}</textarea>
                        <div class="reply-edit-actions" style="display: flex; gap: 6px; justify-content: flex-end;">
                            <button class="btn btn-sm btn-outline-secondary reply-cancel-btn" style="
                                border-radius: 12px;
                                padding: 2px 8px;
                                font-size: 10px;
                            ">Cancel</button>
                            <button class="btn btn-sm btn-primary reply-update-btn" style="
                                border-radius: 12px;
                                padding: 2px 8px;
                                font-size: 10px;
                                background: #4299e1;
                                border: none;
                            ">Update</button>
                        </div>
                    </div>
                </div>
                
                <div class="reply-footer">
                    <button class="btn btn-sm btn-outline-primary like-reply-btn" title="Like Reply" style="
                        border: 1px solid #3182ce;
                        background: ${reply.liked ? '#3182ce' : 'white'};
                        color: ${reply.liked ? 'white' : '#3182ce'};
                        border-radius: 12px;
                        padding: 2px 8px;
                        display: flex;
                        align-items: center;
                        gap: 3px;
                        font-size: 10px;
                    ">
                        <i class="${likeIcon}"></i>
                        <span class="like-count">${reply.likes}</span>
                    </button>
                </div>
            </div>
        `;
    }

    addPostEventListeners() {
        // Comments toggle buttons
        document.querySelectorAll('.comments-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post-item').dataset.postId;
                this.toggleCommentsVisibility(postId);
            });
        });

        // Replies toggle buttons
        document.querySelectorAll('.replies-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentId = e.target.closest('.comment-item').dataset.commentId;
                this.toggleRepliesVisibility(commentId);
            });
        });

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

        // Comment buttons (Show comment input)
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post-item').dataset.postId;
                this.showCommentInput(postId);
            });
        });

        // Cancel comment buttons
        document.querySelectorAll('.cancel-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.closest('.post-item').dataset.postId;
                this.hideCommentInput(postId);
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
                    this.hideCommentInput(postId); // Hide after posting
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Comment posted successfully!', 'success');
                } else {
                    this.showAlert('Please write something to comment.', 'warning');
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
                    const addReplyContainer = commentItem.querySelector('.add-reply-container');
                    addReplyContainer.style.display = 'none';
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Reply posted successfully!', 'success');
                } else {
                    this.showAlert('Please write something to reply.', 'warning');
                }
            });
        });

        // Cancel reply buttons
        document.querySelectorAll('.cancel-reply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentItem = e.target.closest('.comment-item');
                const addReplyContainer = commentItem.querySelector('.add-reply-container');
                const replyInput = commentItem.querySelector('.comment-reply-input');
                addReplyContainer.style.display = 'none';
                replyInput.value = '';
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
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Comment updated successfully!', 'success');
                } else {
                    this.showAlert('Please write something to update.', 'warning');
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
                    this.savePosts();
                    this.renderPosts();
                    this.showAlert('Reply updated successfully!', 'success');
                } else {
                    this.showAlert('Please write something to update.', 'warning');
                }
            });
        });

        // Cancel edit buttons
        document.querySelectorAll('.comment-cancel-btn, .reply-cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.comment-item, .reply-item');
                const editContainer = item.querySelector('.comment-edit-container, .reply-edit-container');
                const textElement = item.querySelector('.comment-text, .reply-text');
                
                editContainer.style.display = 'none';
                textElement.style.display = 'block';
            });
        });

        // Add hover effects for buttons
        this.addHoverEffects();
    }

    addHoverEffects() {
        // Add hover effects for edit/delete buttons
        document.querySelectorAll('.edit-post-btn, .edit-comment-btn, .edit-reply-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(74, 85, 104, 0.2)';
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(74, 85, 104, 0.1)';
                btn.style.transform = 'scale(1)';
            });
        });

        document.querySelectorAll('.delete-post-btn, .delete-comment-btn, .delete-reply-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(229, 62, 62, 0.2)';
                btn.style.transform = 'scale(1.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(229, 62, 62, 0.1)';
                btn.style.transform = 'scale(1)';
            });
        });

        // Add hover effects for input fields
        document.querySelectorAll('.post-comment-input, .comment-reply-input, .comment-edit-input, .reply-edit-input').forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#4299e1';
                input.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)';
            });
            input.addEventListener('blur', () => {
                input.style.borderColor = '#e2e8f0';
                input.style.boxShadow = 'none';
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
    return new Date(timestamp).toLocaleString();
}

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    savePosts() {
        try {
            localStorage.setItem('softspace-posts', JSON.stringify(this.posts));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    loadPosts() {
        try {
            const saved = localStorage.getItem('softspace-posts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return [];
        }
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
        cancelBtn.style.cssText = `
            border-radius: 20px;
            padding: 8px 20px;
            border: 2px solid #cbd5e0;
            background: white;
            color: #4a5568;
            font-weight: 500;
            transition: all 0.2s ease;
            display: none;
        `;
        
        cancelBtn.addEventListener('click', () => {
            window.socialPlatform.cancelEdit();
        });
        
        // Add hover effect
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#f7fafc';
            cancelBtn.style.borderColor = '#a0aec0';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'white';
            cancelBtn.style.borderColor = '#cbd5e0';
        });
        
        submitBtn.parentNode.appendChild(cancelBtn);
        
        // Show/hide cancel button based on edit state
        const observer = new MutationObserver(() => {
            const isEditing = window.socialPlatform && window.socialPlatform.currentEditPostId;
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
      this.commentsContainer.style.cssText = `
        margin-top: 20px;
        padding: 16px 0;
        border-top: 1px solid #e2e8f0;
      `;
      this.section.appendChild(this.commentsContainer);

      try {
        this.comments = JSON.parse(localStorage.getItem(this.commentsKey)) || [];
        this.likes = parseInt(localStorage.getItem(this.likesKey)) || 0;
        this.liked = localStorage.getItem(`liked_article_${this.articleId}`) === 'true';
      } catch (e) {
        this.comments = [];
        this.likes = 0;
        this.liked = false;
      }
      
      this.updateLikeDisplay();

      this.init();
      this.renderComments();
    }

    init() {
      // Like button
      if (this.likeBtn) {
        this.likeBtn.addEventListener("click", () => {
          if (this.liked) {
            this.likes--;
            this.liked = false;
            this.likeBtn.classList.remove("liked");
          } else {
            this.likes++;
            this.liked = true;
            this.likeBtn.classList.add("liked");
          }
          this.updateLikeDisplay();
          try {
            localStorage.setItem(this.likesKey, this.likes);
            localStorage.setItem(`liked_article_${this.articleId}`, this.liked);
          } catch (e) {
            console.warn('Could not save like status:', e);
          }
        });
      }

      // Post button
      if (this.postBtn && this.textarea) {
        this.postBtn.addEventListener("click", () => {
          const text = this.textarea.value.trim();
          if (text) {
            this.addComment(text);
            this.textarea.value = "";
          }
        });
      }

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
      if (this.likeBtn) {
        const span = this.likeBtn.querySelector("span");
        if (span) span.textContent = this.likes;
        if (this.liked) {
          this.likeBtn.classList.add("liked");
          this.likeBtn.style.color = '#e53e3e';
        } else {
          this.likeBtn.classList.remove("liked");
          this.likeBtn.style.color = '#4a5568';
        }
      }
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
      try {
        localStorage.setItem(this.commentsKey, JSON.stringify(this.comments));
      } catch (e) {
        console.warn('Could not save comments:', e);
      }
    }

    renderComments() {
      this.commentsContainer.innerHTML = "";

      this.comments.forEach((comment) => {
        const div = document.createElement("div");
        div.classList.add("comment");
        div.dataset.id = comment.id;
        div.style.cssText = `
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
          position: relative;
        `;

        // Text
        const textP = document.createElement("p");
        textP.textContent = comment.text;
        textP.style.cssText = `
          color: #2d3748;
          line-height: 1.6;
          font-size: 14px;
          margin: 0 0 12px 0;
          padding-right: 60px;
        `;

        // Actions
        const actionsDiv = document.createElement("div");
        actionsDiv.classList.add("comment-actions");
        actionsDiv.style.cssText = `
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 4px;
        `;

        // More button
        const moreBtn = document.createElement("button");
        moreBtn.textContent = "⋮";
        moreBtn.classList.add("more-btn");
        moreBtn.style.cssText = `
          background: rgba(74, 85, 104, 0.1);
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          color: #4a5568;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        `;

        // Menu
        const menuDiv = document.createElement("div");
        menuDiv.classList.add("menu-div");
        menuDiv.style.cssText = `
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 100;
          overflow: hidden;
        `;

        const menuButtonsWrapper = document.createElement("div");
        menuButtonsWrapper.classList.add("menu-buttons-wrapper");
        menuButtonsWrapper.style.cssText = `
          display: flex;
          flex-direction: column;
        `;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");
        editBtn.style.cssText = `
          background: none;
          border: none;
          padding: 8px 16px;
          color: #4a5568;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
        `;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.style.cssText = `
          background: none;
          border: none;
          padding: 8px 16px;
          color: #e53e3e;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s ease;
          border-top: 1px solid #f7fafc;
        `;

        // Add hover effects
        editBtn.addEventListener('mouseenter', () => {
          editBtn.style.background = '#f7fafc';
        });
        editBtn.addEventListener('mouseleave', () => {
          editBtn.style.background = 'none';
        });

        deleteBtn.addEventListener('mouseenter', () => {
          deleteBtn.style.background = '#fed7d7';
        });
        deleteBtn.addEventListener('mouseleave', () => {
          deleteBtn.style.background = 'none';
        });

        moreBtn.addEventListener('mouseenter', () => {
          moreBtn.style.background = 'rgba(74, 85, 104, 0.2)';
        });
        moreBtn.addEventListener('mouseleave', () => {
          moreBtn.style.background = 'rgba(74, 85, 104, 0.1)';
        });

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
          
          // Close all other menus first
          this.commentsContainer.querySelectorAll(".menu-div").forEach((otherMenu) => {
            if (otherMenu !== menuDiv) {
              otherMenu.style.display = "none";
            }
          });
          
          menuDiv.style.display = menuDiv.style.display === "none" ? "block" : "none";
        });

        // Edit
        editBtn.addEventListener("click", () => {
          menuDiv.style.display = "none";
          
          const editBox = document.createElement("textarea");
          editBox.value = comment.text;
          editBox.classList.add("comment-edit-textarea");
          editBox.style.cssText = `
            width: 100%;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
            margin-bottom: 8px;
            font-family: inherit;
          `;

          const saveBtn = document.createElement("button");
          saveBtn.textContent = "Save";
          saveBtn.classList.add("save-btn");
          saveBtn.style.cssText = `
            background: #4299e1;
            color: white;
            border: none;
            border-radius: 16px;
            padding: 6px 16px;
            font-size: 12px;
            cursor: pointer;
            margin-right: 8px;
            transition: background 0.2s ease;
          `;

          const cancelBtn = document.createElement("button");
          cancelBtn.textContent = "Cancel";
          cancelBtn.classList.add("cancel-btn");
          cancelBtn.style.cssText = `
            background: white;
            color: #4a5568;
            border: 1px solid #cbd5e0;
            border-radius: 16px;
            padding: 6px 16px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          `;

          // Hide original text
          textP.style.display = "none";

          // Create edit actions wrapper
          const editActionsWrapper = document.createElement("div");
          editActionsWrapper.classList.add("comment-edit-actions");
          editActionsWrapper.style.cssText = `
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          `;
          editActionsWrapper.appendChild(saveBtn);
          editActionsWrapper.appendChild(cancelBtn);

          // Insert edit elements
          div.insertBefore(editBox, actionsDiv);
          div.insertBefore(editActionsWrapper, actionsDiv);

          // Hide original actions
          actionsDiv.style.display = "none";

          editBox.focus();
          editBox.select();

          // Add hover effects
          saveBtn.addEventListener('mouseenter', () => {
            saveBtn.style.background = '#3182ce';
          });
          saveBtn.addEventListener('mouseleave', () => {
            saveBtn.style.background = '#4299e1';
          });

          cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#f7fafc';
            cancelBtn.style.borderColor = '#a0aec0';
          });
          cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'white';
            cancelBtn.style.borderColor = '#cbd5e0';
          });

          editBox.addEventListener('focus', () => {
            editBox.style.borderColor = '#4299e1';
            editBox.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.1)';
          });
          editBox.addEventListener('blur', () => {
            editBox.style.borderColor = '#e2e8f0';
            editBox.style.boxShadow = 'none';
          });

          saveBtn.addEventListener("click", () => {
            const newText = editBox.value.trim();
            if (newText) {
              this.editComment(comment.id, newText);
            } else {
              this.renderComments();
            }
          });

          cancelBtn.addEventListener("click", () => {
            this.renderComments();
          });
        });

        // Delete
        deleteBtn.addEventListener("click", () => {
          menuDiv.style.display = "none";
          this.deleteComment(comment.id);
        });

        this.commentsContainer.appendChild(div);
      });
    }
  }

  // Initialize for all comment sections
  document.querySelectorAll(".comment-section").forEach((section) => {
    new CommentSystem(section);
  });

});