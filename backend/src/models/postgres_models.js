const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

// Users Model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false
});

// Projects Model
const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    manager_id: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'projects',
    timestamps: false
});

// Tasks Model
const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    project_id: {
        type: DataTypes.UUID,
        references: {
            model: Project,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('To Do', 'In Progress', 'Done'),
        defaultValue: 'To Do'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },
    assignee_id: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'tasks',
    timestamps: false
});

// Roles Model
const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        }
    },
    project_id: {
        type: DataTypes.UUID,
        references: {
            model: Project,
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('Manager', 'Contributor', 'Viewer'),
        allowNull: false
    }
}, {
    tableName: 'roles',
    timestamps: false
});

// Associations
User.hasMany(Project, { foreignKey: 'manager_id' });
Project.belongsTo(User, { foreignKey: 'manager_id' });

User.hasMany(Task, { foreignKey: 'assignee_id' });
Task.belongsTo(User, { foreignKey: 'assignee_id' });

Project.hasMany(Task, { foreignKey: 'project_id' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

User.hasMany(Role, { foreignKey: 'user_id' });
Role.belongsTo(User, { foreignKey: 'user_id' });

Project.hasMany(Role, { foreignKey: 'project_id' });
Role.belongsTo(Project, { foreignKey: 'project_id' });

// Sync Models (be cautious with force: true in production)
const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('PostgreSQL models synced successfully');
    } catch (error) {
        console.error('Error syncing PostgreSQL models:', error);
    }
};

module.exports = {
    User,
    Project,
    Task,
    Role,
    sequelize,
    syncModels
};