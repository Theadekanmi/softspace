// COMPLETE WORKING SOCIAL MEDIA PLATFORM FOR SOFTSPACE
console.log('🚀 SoftSpace JavaScript Loading...');

// Global variables (idempotent across multiple loads)
var supabaseClient;
var currentUser = window.currentUser || null;
var posts = window.posts || [];

function getDisplayName(user) {
    if (!user) return 'User';
    const fullName = user.user_metadata && user.user_metadata.full_name;
    if (fullName && String(fullName).trim()) return fullName;
    return (user.email || 'User').split('@')[0];
}

function clearAuthHashIfError() {
    if (location.hash && location.hash.includes('error=')) {
        console.warn('Clearing auth error hash:', location.hash);
        history.replaceState('', document.title, location.pathname + location.search);
    }
}

// Wait for Supabase to be available
function waitForSupabase() {
    if (typeof supabase !== 'undefined') {
        console.log('✅ Supabase loaded, initializing...');
        initializeApp();
    } else {
        console.log('⏳ Waiting for Supabase...');
        setTimeout(waitForSupabase, 100);
    }
}

function initializeApp() {
    if (window.__softspaceInited) {
        console.warn('SoftSpace already initialized - skipping duplicate init');
        return;
    }
    const SUPABASE_URL = 'https://rfopqciinmhyecvvulik.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmb3BxY2lpbm1oeWVjdnZ1bGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjQzMjMsImV4cCI6MjA3MTk0MDMyM30.YVZuHc4k8BLw7ZPr-HScPh5cvt-wrAsva5_xEk8tCEw';
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    });
    console.log('🔧 Supabase client created');
    window.__softspaceInited = true;

    clearAuthHashIfError();
    
    // Initialize everything
    setupAuth();
    loadPosts();
    setupEventListeners();
    setupArticleBlocks();
}

// Authentication functions
async function setupAuth() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('✅ User already signed in:', getDisplayName(currentUser));
            updateAuthUI();
        }

        if (!window.__softspaceAuthListenerSet) {
            window.__softspaceAuthListenerSet = true;
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    currentUser = session.user;
                    console.log('🔐 User signed in:', getDisplayName(currentUser));
                    updateAuthUI();
                    loadPosts();
                    setupArticleBlocks(true);
                } else if (event === 'SIGNED_OUT') {
                    currentUser = null;
                    console.log('🚪 User signed out');
                    updateAuthUI();
                    loadPosts();
                    setupArticleBlocks(true);
                }
            });
        }
    } catch (error) {
        console.error('❌ Auth setup error:', error);
    }
}

function updateAuthUI() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;
    if (currentUser) {
        authContainer.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <span class="text-white small">Welcome, ${getDisplayName(currentUser)}</span>
                <button class="btn btn-outline-light btn-sm" onclick="signOut()">Sign Out</button>
            </div>
        `;
                } else {
        authContainer.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-primary btn-sm" onclick="showSignInModal()">Sign In</button>
                <button class="btn btn-outline-light btn-sm" onclick="showSignUpModal()">Sign Up</button>
            </div>
        `;
    }
}

// Modal functions
function showSignInModal() {
    const modalHTML = `
        <div class="modal fade" id="signInModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Sign In to SoftSpace</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="signin-form">
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleSignIn()">Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('signInModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('signInModal');
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

function showSignUpModal() {
    const modalHTML = `
        <div class="modal fade" id="signUpModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Join SoftSpace</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="signup-form">
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" name="email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-control" name="password" minlength="6" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" name="confirmPassword" minlength="6" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleSignUp()">Create Account</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('signUpModal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('signUpModal');
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

// Auth handlers
async function handleSignIn() {
    const form = document.getElementById('signin-form');
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    try {
        console.log('🔐 Attempting sign in...');
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const modal = document.getElementById('signInModal');
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        alert('✅ Successfully signed in!');
    } catch (error) {
        console.error('❌ Sign in failed:', error);
        alert('❌ Sign in failed: ' + error.message);
    }
}

async function handleSignUp() {
    const form = document.getElementById('signup-form');
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match!');
            return;
        }
    try {
        console.log('📝 Attempting sign up...');
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        const modal = document.getElementById('signUpModal');
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        alert('✅ Account created! If email confirmation is enabled, check your inbox.');
    } catch (error) {
        console.error('❌ Sign up failed:', error);
        alert('❌ Sign up failed: ' + error.message);
    }
}

async function signOut() {
    try {
        await supabaseClient.auth.signOut();
        alert('✅ Signed out');
    } catch (error) {
        console.error('❌ Sign out failed:', error);
        alert('❌ Sign out failed: ' + error.message);
    }
}

// Posts functions
async function loadPosts() {
    try {
        console.log('📥 Loading posts...');
        const { data, error } = await supabaseClient
            .from('posts')
            .select(`
                *,
                comments (
                    *,
                    replies (*)
                )
            `)
            .not('content', 'ilike', 'Article:%')
            .order('created_at', { ascending: false });
        if (error) throw error;
        posts = data || [];
        console.log('✅ Posts loaded:', posts.length);
        renderPosts();
    } catch (error) {
        console.error('❌ Error loading posts:', error);
        posts = [];
        renderPosts();
    }
}

function renderPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) {
        console.log('❌ Posts container not found');
            return;
        }
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-feather fa-2x mb-3"></i>
                <p>No posts yet. Be the first to share your thoughts!</p>
            </div>
        `;
        return;
    }
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-item card mb-4" data-post-id="${post.id}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 class="card-subtitle mb-1 text-muted">${post.author_name}</h6>
                        <small class="text-muted">${new Date(post.created_at).toLocaleString()}</small>
                    </div>
                    ${currentUser && currentUser.id === post.author_id ? 
                        `<div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-warning" onclick="showPostEditForm(${post.id})">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deletePost(${post.id})">Delete</button>
                        </div>` : 
                        ''
                    }
                </div>
                <div class="post-content" id="post-content-${post.id}">${post.content}</div>
                <div class="post-actions d-flex gap-2 mb-3 mt-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="togglePostLike(${post.id})">
                        <i class="far fa-heart"></i> Like (${post.likes || 0})
                    </button>
                </div>
                <div class="comments-section">
                    <h6 class="mb-3">Comments (${post.comments ? post.comments.length : 0})</h6>
                    <div class="comment-input-container mb-3">
                        <div class="input-group">
                            <input type="text" class="form-control comment-input" placeholder="Write a comment..." maxlength="300">
                            <button class="btn btn-primary btn-sm" onclick="addComment(${post.id}, this.previousElementSibling)">Post</button>
                        </div>
                    </div>
                    <div class="comments-list">
                        ${(post.comments || []).map(comment => `
                            <div class="comment-item mb-3 p-3 bg-light rounded" data-comment-id="${comment.id}">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <div class="d-flex align-items-center gap-2 mb-1">
                                            <strong class="comment-author">${comment.author_name}</strong>
                                            <small class="text-muted">${new Date(comment.created_at).toLocaleString()}</small>
                                        </div>
                                        <div class="comment-content">${comment.content}</div>
                                        <div class="comment-actions d-flex gap-2 mt-2">
                                            <button class="btn btn-sm btn-outline-primary" onclick="toggleCommentLike(${comment.id})">
                                                <i class="far fa-heart"></i> Like (${comment.likes || 0})
                                            </button>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="showReplyForm(${comment.id})">Reply</button>
                                            ${currentUser && currentUser.id === comment.author_id ? 
                                                `<button class="btn btn-sm btn-outline-warning" onclick="showCommentEditForm(${comment.id})">Edit</button>
                                                 <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${comment.id})">Delete</button>` : 
                                                ''
                                            }
                                        </div>
                                        <div class="reply-form mt-2" id="reply-form-${comment.id}" style="display: none;">
                                            <div class="input-group">
                                                <input type="text" class="form-control reply-input" placeholder="Write a reply..." maxlength="200">
                                                <button class="btn btn-primary btn-sm" onclick="addReply(${comment.id}, ${post.id}, this.previousElementSibling)">Reply</button>
                                            </div>
                                        </div>
                                        ${(comment.replies || []).length > 0 ? `
                                            <div class="replies-list mt-2 ms-4">
                                                ${comment.replies.map(reply => `
                                                    <div class="reply-item mb-2 p-2 bg-white rounded border" data-reply-id="${reply.id}">
                                                        <div class="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <div class="d-flex align-items-center gap-2 mb-1">
                                                                    <strong class="reply-author">${reply.author_name}</strong>
                                                                    <small class="text-muted">${new Date(reply.created_at).toLocaleString()}</small>
                                                                </div>
                                                                <div class="reply-content" id="reply-content-${reply.id}">${reply.content}</div>
                                                            </div>
                                                            ${currentUser && currentUser.id === reply.author_id ? `
                                                                <div class="d-flex gap-2 ms-2">
                                                                    <button class="btn btn-sm btn-outline-warning" onclick="showReplyEditForm(${reply.id})">Edit</button>
                                                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReply(${reply.id})">Delete</button>
                                                                </div>
                                                            ` : ''}
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Post edit
function showPostEditForm(postId) {
    const contentDiv = document.getElementById(`post-content-${postId}`);
    const currentContent = contentDiv.textContent;
    contentDiv.innerHTML = `
        <div class="post-edit-form">
            <textarea class="form-control mb-2" rows="3">${currentContent}</textarea>
            <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm" onclick="savePostEdit(${postId}, this.previousElementSibling)">Save</button>
                <button class="btn btn-secondary btn-sm" onclick="cancelPostEdit(${postId}, '${currentContent.replace(/'/g, "&#39;")}')">Cancel</button>
            </div>
        </div>
    `;
}

async function savePostEdit(postId, textarea) {
    // Fallback: find textarea if not passed
    if (!textarea) {
        textarea = document.querySelector(`#post-content-${postId} textarea`);
    }
    if (!textarea) {
        console.error('Edit textarea not found for post', postId);
        alert('Unable to save. Please try again.');
        return;
    }
    const newContent = textarea.value.trim();
    if (!newContent) return;
    try {
        const { error } = await supabaseClient
            .from('posts')
            .update({ content: newContent })
            .eq('id', postId);
        if (error) throw error;
        loadPosts();
    } catch (error) {
        console.error('❌ Error updating post:', error);
        alert('❌ Failed to update post: ' + error.message);
    }
}

function cancelPostEdit(postId, originalContent) {
    const contentDiv = document.getElementById(`post-content-${postId}`);
    contentDiv.textContent = originalContent;
}

// Reply edit/delete
function showReplyEditForm(replyId) {
    const contentDiv = document.getElementById(`reply-content-${replyId}`);
    const currentContent = contentDiv.textContent;
    contentDiv.innerHTML = `
        <div class="reply-edit-form">
            <textarea class="form-control mb-2" rows="2">${currentContent}</textarea>
            <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm" onclick="saveReplyEdit(${replyId}, this.previousElementSibling)">Save</button>
                <button class="btn btn-secondary btn-sm" onclick="cancelReplyEdit(${replyId}, '${currentContent.replace(/'/g, "&#39;")}')">Cancel</button>
            </div>
        </div>
    `;
}

async function saveReplyEdit(replyId, textarea) {
    if (!textarea) {
        textarea = document.querySelector(`#reply-content-${replyId} textarea`);
    }
    if (!textarea) {
        console.error('Edit textarea not found for reply', replyId);
        alert('Unable to save. Please try again.');
        return;
    }
    const newContent = textarea.value.trim();
    if (!newContent) return;
    try {
        const { error } = await supabaseClient
            .from('replies')
            .update({ content: newContent })
            .eq('id', replyId);
        if (error) throw error;
        loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error updating reply:', error);
        alert('❌ Failed to update reply: ' + error.message);
    }
}

function cancelReplyEdit(replyId, originalContent) {
    const contentDiv = document.getElementById(`reply-content-${replyId}`);
    contentDiv.textContent = originalContent;
}

async function deleteReply(replyId) {
    if (!confirm('Delete this reply?')) return;
    try {
            const { error } = await supabaseClient
            .from('replies')
            .delete()
            .eq('id', replyId);
        if (error) throw error;
        loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error deleting reply:', error);
        alert('❌ Failed to delete reply: ' + error.message);
    }
}

// Like/unlike helpers (client-side remembered per browser)
function isLiked(key) {
    return localStorage.getItem(key) === '1';
}
function setLiked(key, liked) {
    localStorage.setItem(key, liked ? '1' : '0');
}

async function togglePostLike(postId) {
    if (!currentUser) { alert('Please sign in to like posts!'); return; }
    const key = `like_post_${postId}`;
    const liked = isLiked(key);
    const delta = liked ? -1 : 1;
    try {
        const { error } = await supabaseClient.rpc('increment_post_likes', {
            p_post_id: postId,
            p_delta: delta
        });
        if (error) throw error;
        setLiked(key, !liked);
        await loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error toggling post like:', error);
    }
}

async function toggleCommentLike(commentId) {
    if (!currentUser) { alert('Please sign in to like comments!'); return; }
    const key = `like_comment_${commentId}`;
    const liked = isLiked(key);
    const delta = liked ? -1 : 1;
    try {
        const { error } = await supabaseClient.rpc('increment_comment_likes', {
            p_comment_id: commentId,
            p_delta: delta
        });
        if (error) throw error;
        setLiked(key, !liked);
        await loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error toggling comment like:', error);
    }
}

// Comment edit (already existed)
function showCommentEditForm(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const contentDiv = commentItem.querySelector('.comment-content');
    const currentContent = contentDiv.textContent;
    contentDiv.innerHTML = `
        <div class="comment-edit-form">
            <textarea class="form-control mb-2" rows="2">${currentContent}</textarea>
            <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm" onclick="saveCommentEdit(${commentId}, this.previousElementSibling)">Save</button>
                <button class="btn btn-secondary btn-sm" onclick="cancelCommentEdit(${commentId}, '${currentContent.replace(/'/g, "&#39;")}')">Cancel</button>
            </div>
        </div>
    `;
}

async function saveCommentEdit(commentId, textarea) {
    if (!textarea) {
        const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
        textarea = commentItem && commentItem.querySelector('textarea');
    }
    if (!textarea) {
        console.error('Edit textarea not found for comment', commentId);
        alert('Unable to save. Please try again.');
        return;
    }
    const newContent = textarea.value.trim();
    if (!newContent) return;
    try {
        const { error } = await supabaseClient
            .from('comments')
            .update({ content: newContent })
            .eq('id', commentId);
        if (error) throw error;
        loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error updating comment:', error);
        alert('❌ Failed to update comment: ' + error.message);
    }
}

function cancelCommentEdit(commentId, originalContent) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    const contentDiv = commentItem.querySelector('.comment-content');
    contentDiv.textContent = originalContent;
}

// Comments/replies creation & deletion kept as-is
async function addComment(postId, inputElement) {
    const content = inputElement.value.trim();
    if (!content) return;
    if (!currentUser) { alert('Please sign in to comment!'); return; }
    try {
        const { data, error } = await supabaseClient
            .from('comments')
            .insert({
                post_id: postId,
                content: content,
                author_name: getDisplayName(currentUser),
                author_id: currentUser.id
            })
            .select()
            .single();
        if (error) throw error;
        inputElement.value = '';
        loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error adding comment:', error);
        alert('❌ Failed to add comment: ' + error.message);
    }
}

async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', commentId);
        if (error) throw error;
        loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error deleting comment:', error);
        alert('❌ Failed to delete comment: ' + error.message);
    }
}

function showReplyForm(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
}

async function addReply(commentId, postId, inputElement) {
    const content = inputElement.value.trim();
    if (!content) return;
    if (!currentUser) { alert('Please sign in to reply!'); return; }
    try {
        const { data, error } = await supabaseClient
            .from('replies')
            .insert({
                post_id: postId,
                comment_id: commentId,
                content: content,
                author_name: getDisplayName(currentUser),
                author_id: currentUser.id
            })
            .select()
            .single();
        if (error) throw error;
        inputElement.value = '';
        document.getElementById(`reply-form-${commentId}`).style.display = 'none';
        loadPosts();
        await setupArticleBlocks(true);
    } catch (error) {
        console.error('❌ Error adding reply:', error);
        alert('❌ Failed to add reply: ' + error.message);
    }
}

// Post actions
async function createPost(content) {
    if (!content.trim()) return;
    try {
        const { data, error } = await supabaseClient
            .from('posts')
            .insert({
                content: content.trim(),
                author_name: currentUser ? getDisplayName(currentUser) : 'Anonymous',
                author_id: currentUser ? currentUser.id : null
            })
            .select()
            .single();
        if (error) throw error;
        alert('✅ Post created successfully!');
        loadPosts();
    } catch (error) {
        console.error('❌ Error creating post:', error);
        alert('❌ Failed to create post: ' + error.message);
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
        const { error } = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', postId);
        if (error) throw error;
        loadPosts();
    } catch (error) {
        console.error('❌ Error deleting post:', error);
        alert('❌ Failed to delete post: ' + error.message);
    }
}

// Article comment blocks support
async function findOrCreateArticlePost(articleTitle) {
    // Look for a post with content marker for this article
    const marker = `Article: ${articleTitle}`;
    let { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('content', marker)
        .limit(1)
        .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) return data;
    // Create if missing
    const insertAuthor = currentUser ? getDisplayName(currentUser) : 'System';
    const { data: created, error: insErr } = await supabaseClient
        .from('posts')
        .insert({ content: marker, author_name: insertAuthor, author_id: currentUser ? currentUser.id : null })
        .select()
        .single();
    if (insErr) throw insErr;
    return created;
}

async function loadArticleComments(postId) {
    const { data, error } = await supabaseClient
        .from('comments')
        .select('*, replies(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

function renderArticleBlock(container, articlePost, comments) {
    const commentsContainer = container.querySelector('.comments-container');
    if (!commentsContainer) return;
    commentsContainer.innerHTML = (comments || []).map(comment => `
        <div class="comment-item mb-3 p-3 bg-light rounded" data-comment-id="${comment.id}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <strong class="comment-author">${comment.author_name}</strong>
                        <small class="text-muted">${new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                    <div class="comment-actions d-flex gap-2 mt-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="toggleCommentLike(${comment.id})">
                            <i class="far fa-heart"></i> Like (${comment.likes || 0})
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="showReplyForm(${comment.id})">Reply</button>
                        ${currentUser && currentUser.id === comment.author_id ? 
                            `<button class="btn btn-sm btn-outline-warning" onclick="showCommentEditForm(${comment.id})">Edit</button>
                             <button class="btn btn-sm btn-outline-danger" onclick="deleteComment(${comment.id})">Delete</button>` : 
                            ''
                        }
                </div>
                    <div class="reply-form mt-2" id="reply-form-${comment.id}" style="display: none;">
                        <div class="input-group">
                            <input type="text" class="form-control reply-input" placeholder="Write a reply..." maxlength="200">
                            <button class="btn btn-primary btn-sm" onclick="addReply(${comment.id}, ${articlePost.id}, this.previousElementSibling)">Reply</button>
                    </div>
                </div>
                    ${(comment.replies || []).length > 0 ? `
                        <div class="replies-list mt-2 ms-4">
                            ${comment.replies.map(reply => `
                                <div class="reply-item mb-2 p-2 bg-white rounded border" data-reply-id="${reply.id}">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <div class="d-flex align-items-center gap-2 mb-1">
                                                <strong class="reply-author">${reply.author_name}</strong>
                                                <small class="text-muted">${new Date(reply.created_at).toLocaleString()}</small>
                        </div>
                                            <div class="reply-content" id="reply-content-${reply.id}">${reply.content}</div>
                    </div>
                                        ${currentUser && currentUser.id === reply.author_id ? `
                                            <div class="d-flex gap-2 ms-2">
                                                <button class="btn btn-sm btn-outline-warning" onclick="showReplyEditForm(${reply.id})">Edit</button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="deleteReply(${reply.id})">Delete</button>
                </div>
                                        ` : ''}
                </div>
                    </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    </div>
                    </div>
                </div>
    `).join('');
}

async function setupArticleBlocks(forceReload) {
    const blocks = document.querySelectorAll('.article-comment-block[data-article-title]');
    if (!blocks.length) return;
    for (const block of blocks) {
        try {
            const title = block.getAttribute('data-article-title');
            const post = await findOrCreateArticlePost(title);
            if (forceReload) {
                // no-op, just ensuring re-render after auth change
            }
            const comments = await loadArticleComments(post.id);
            renderArticleBlock(block, post, comments);
            const input = block.querySelector('.comment-input');
            const btn = block.querySelector('.submit-comment-btn');
            if (btn && input) {
                btn.onclick = () => addComment(post.id, input);
            }
        } catch (e) {
            console.error('Article block setup error:', e);
        }
    }
}

// Event listeners
function setupEventListeners() {
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = e.target.querySelector('textarea[name="content"]').value;
            createPost(content);
            e.target.reset();
        });
    }
}

// Make functions globally available
window.showSignInModal = showSignInModal;
window.showSignUpModal = showSignUpModal;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.signOut = signOut;
window.createPost = createPost;
window.deletePost = deletePost;
window.togglePostLike = togglePostLike;
window.addComment = addComment;
window.deleteComment = deleteComment;
window.toggleCommentLike = toggleCommentLike;
window.showCommentEditForm = showCommentEditForm;
window.saveCommentEdit = saveCommentEdit;
window.cancelCommentEdit = cancelCommentEdit;
window.showReplyForm = showReplyForm;
window.addReply = addReply;
window.showPostEditForm = showPostEditForm;
window.savePostEdit = savePostEdit;
window.cancelPostEdit = cancelPostEdit;
window.showReplyEditForm = showReplyEditForm;
window.saveReplyEdit = saveReplyEdit;
window.cancelReplyEdit = cancelReplyEdit;
window.deleteReply = deleteReply;
window.findOrCreateArticlePost = findOrCreateArticlePost;
window.loadArticleComments = loadArticleComments;
window.renderArticleBlock = renderArticleBlock;
window.setupArticleBlocks = setupArticleBlocks;

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForSupabase);
} else {
    waitForSupabase();
}

