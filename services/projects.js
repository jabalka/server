const Project = require('../models/Project');
// ALL PROJECTS
// async function getAll(page = 1, pageSize = 2){
//     const skip = (page - 1) * pageSize;
//     // console.log(`Fetching projects with skip: ${skip}, limit: ${pageSize}`);
//     const projects = await Project.find({}).skip(skip).limit(pageSize).lean();
//     return projects;
// }

async function getAll(query = {}, page = 1, pageSize = 2) {
    const skip = (page - 1) * pageSize;
    const projects = await Project.find(query).skip(skip).limit(pageSize).lean();
    return projects;
}
// project by owner
async function findByOwner(ownerId, page = 1, pageSize = 2) {
    try {
        const skip = (page - 1) * pageSize;
        // console.log(`Finding projects for ownerId: ${ownerId}, skip: ${skip}, limit: ${pageSize}`);
        // Find projects by owner ID with pagination
        const projects = await Project.find({ owner: ownerId }).skip(skip).limit(pageSize).lean();
        // console.log('projects: ',projects)
        // Get the total count of projects by owner ID
        const totalProjects = await Project.countDocuments({ owner: ownerId });
        // console.log(`Found ${projects.length} projects out of ${totalProjects}`);
        return { projects, totalProjects };
    } catch (error) {
        throw new Error(`Error finding projects by owner ID: ${error.message}`);
    }
}


async function getCollectionLength(){
    return Project.countDocuments({});
}
// CREATE PROJECT
async function create(data){
    const result = new Project(data);
    await result.save();
    return result;
}
// GET 1 PROJECT
async function getById(id){
    return Project.findById(id);
}
// UPDATE PROJECT
async function update(original, updated){
    Object.assign(original, updated);
    await original.save();
     return original;
}
// DELETE PROJECT
async function remove(id){
    return Project.findByIdAndDelete(id);
}

module.exports = {
    getAll,
    findByOwner,
    create,
    getById,
    update,
    remove,
    getCollectionLength
}
