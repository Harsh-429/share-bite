// ShareBite Backend System
// This file handles data storage and management for the ShareBite application

class ShareBiteBackend {
    constructor() {
        this.users = this.loadUsers();
        this.foodPosts = this.loadFoodPosts();
        this.orders = this.loadOrders();
        this.init();
    }

    init() {
        // Initialize with sample data if empty
        if (this.users.length === 0) {
            this.createSampleData();
        }
    }

    // User Management
    createUser(userData) {
        const user = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date().toISOString(),
            isVerified: false,
            rating: 0,
            totalPosts: 0,
            totalMeals: 0
        };
        
        this.users.push(user);
        this.saveUsers();
        return user;
    }

    updateUser(userId, userData) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...userData };
            this.saveUsers();
            return this.users[userIndex];
        }
        return null;
    }

    getUser(userId) {
        return this.users.find(user => user.id === userId);
    }

    getAllUsers() {
        return this.users;
    }

    // Food Post Management
    createFoodPost(postData) {
        const post = {
            id: this.generateId(),
            ...postData,
            createdAt: new Date().toISOString(),
            status: 'available',
            requests: [],
            views: 0
        };
        
        this.foodPosts.push(post);
        this.saveFoodPosts();
        
        // Update user's total posts
        const user = this.getUser(postData.userId);
        if (user) {
            user.totalPosts++;
            this.saveUsers();
        }
        
        return post;
    }

    updateFoodPost(postId, postData) {
        const postIndex = this.foodPosts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
            this.foodPosts[postIndex] = { ...this.foodPosts[postIndex], ...postData };
            this.saveFoodPosts();
            return this.foodPosts[postIndex];
        }
        return null;
    }

    deleteFoodPost(postId) {
        const postIndex = this.foodPosts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
            const post = this.foodPosts[postIndex];
            this.foodPosts.splice(postIndex, 1);
            this.saveFoodPosts();
            
            // Update user's total posts
            const user = this.getUser(post.userId);
            if (user) {
                user.totalPosts--;
                this.saveUsers();
            }
            
            return true;
        }
        return false;
    }

    getFoodPostsByUser(userId) {
        return this.foodPosts.filter(post => post.userId === userId);
    }

    getAllFoodPosts() {
        return this.foodPosts;
    }

    // Request Management
    createRequest(requestData) {
        const request = {
            id: this.generateId(),
            ...requestData,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        // Add request to the food post
        const postIndex = this.foodPosts.findIndex(post => post.id === requestData.postId);
        if (postIndex !== -1) {
            if (!this.foodPosts[postIndex].requests) {
                this.foodPosts[postIndex].requests = [];
            }
            this.foodPosts[postIndex].requests.push(request);
            this.saveFoodPosts();
        }
        
        this.saveRequests();
        return request;
    }

    updateRequestStatus(requestId, status) {
        // Find and update request in food posts
        for (let post of this.foodPosts) {
            if (post.requests) {
                const requestIndex = post.requests.findIndex(req => req.id === requestId);
                if (requestIndex !== -1) {
                    post.requests[requestIndex].status = status;
                    post.requests[requestIndex].updatedAt = new Date().toISOString();
                    this.saveFoodPosts();
                    return post.requests[requestIndex];
                }
            }
        }
        return null;
    }

    getRequestsByPost(postId) {
        const post = this.foodPosts.find(post => post.id === postId);
        return post ? (post.requests || []) : [];
    }

    getRequestsByUser(userId) {
        const userRequests = [];
        for (let post of this.foodPosts) {
            if (post.requests) {
                const postRequests = post.requests.filter(req => req.userId === userId);
                userRequests.push(...postRequests.map(req => ({...req, postId: post.id, postName: post.foodName})));
            }
        }
        return userRequests;
    }

    // Order Management
    createOrder(orderData) {
        const order = {
            id: this.generateId(),
            ...orderData,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        
        this.orders.push(order);
        this.saveOrders();
        return order;
    }

    updateOrderStatus(orderId, status) {
        const orderIndex = this.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = status;
            this.orders[orderIndex].updatedAt = new Date().toISOString();
            this.saveOrders();
            return this.orders[orderIndex];
        }
        return null;
    }

    getOrdersByUser(userId) {
        return this.orders.filter(order => order.userId === userId || order.sellerId === userId);
    }

    // Data Persistence
    saveUsers() {
        localStorage.setItem('sharebite_users', JSON.stringify(this.users));
    }

    loadUsers() {
        const users = localStorage.getItem('sharebite_users');
        return users ? JSON.parse(users) : [];
    }

    saveFoodPosts() {
        localStorage.setItem('sharebite_food_posts', JSON.stringify(this.foodPosts));
    }

    loadFoodPosts() {
        const posts = localStorage.getItem('sharebite_food_posts');
        return posts ? JSON.parse(posts) : [];
    }

    saveOrders() {
        localStorage.setItem('sharebite_orders', JSON.stringify(this.orders));
    }

    loadOrders() {
        const orders = localStorage.getItem('sharebite_orders');
        return orders ? JSON.parse(orders) : [];
    }

    saveRequests() {
        localStorage.setItem('sharebite_requests', JSON.stringify(this.getAllRequests()));
    }

    loadRequests() {
        const requests = localStorage.getItem('sharebite_requests');
        return requests ? JSON.parse(requests) : [];
    }

    getAllRequests() {
        const allRequests = [];
        for (let post of this.foodPosts) {
            if (post.requests) {
                allRequests.push(...post.requests.map(req => ({...req, postId: post.id, postName: post.foodName})));
            }
        }
        return allRequests;
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createSampleData() {
        // Create sample users
        const sampleUsers = [
            {
                id: 'user1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+91 98765 43210',
                orgName: 'Sample Restaurant',
                orgType: 'restaurant',
                address: '123 Main Street, New Delhi',
                role: 'provider',
                isVerified: true,
                rating: 4.8,
                totalPosts: 5,
                totalMeals: 150
            },
            {
                id: 'user2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                phone: '+91 98765 43211',
                orgName: 'Local NGO',
                orgType: 'ngo',
                address: '456 NGO Street, Mumbai',
                role: 'receiver',
                isVerified: true,
                rating: 4.9,
                totalPosts: 0,
                totalMeals: 0
            }
        ];

        this.users = sampleUsers;
        this.saveUsers();

        // Create sample food posts
        const samplePosts = [
            {
                id: 'post1',
                userId: 'user1',
                foodName: 'Fresh Rotis & Dal',
                foodType: 'vegetarian',
                category: 'human',
                quantity: 50,
                unit: 'servings',
                pricePerUnit: 2,
                totalAmount: 100,
                safeUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                description: 'Freshly prepared rotis with dal, perfect for lunch',
                status: 'available',
                requests: [],
                views: 15,
                createdAt: new Date().toISOString()
            }
        ];

        this.foodPosts = samplePosts;
        this.saveFoodPosts();
    }

    // Search and Filter Functions
    searchFoodPosts(query, filters = {}) {
        let results = this.foodPosts.filter(post => post.status === 'available');
        
        if (query) {
            results = results.filter(post => 
                post.foodName.toLowerCase().includes(query.toLowerCase()) ||
                post.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (filters.foodType) {
            results = results.filter(post => post.foodType === filters.foodType);
        }

        if (filters.category) {
            results = results.filter(post => post.category === filters.category);
        }

        if (filters.maxPrice) {
            results = results.filter(post => post.pricePerUnit <= filters.maxPrice);
        }

        return results;
    }

    // Statistics
    getStats() {
        return {
            totalUsers: this.users.length,
            totalPosts: this.foodPosts.length,
            totalOrders: this.orders.length,
            totalMealsSaved: this.foodPosts.reduce((sum, post) => sum + (post.quantity || 0), 0),
            verifiedUsers: this.users.filter(user => user.isVerified).length,
            activePosts: this.foodPosts.filter(post => post.status === 'available').length
        };
    }

    // Export data
    exportData() {
        return {
            users: this.users,
            foodPosts: this.foodPosts,
            orders: this.orders,
            exportedAt: new Date().toISOString()
        };
    }

    // Import data
    importData(data) {
        if (data.users) this.users = data.users;
        if (data.foodPosts) this.foodPosts = data.foodPosts;
        if (data.orders) this.orders = data.orders;
        
        this.saveUsers();
        this.saveFoodPosts();
        this.saveOrders();
    }
}

// Initialize backend
window.sharebiteBackend = new ShareBiteBackend();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShareBiteBackend;
}
