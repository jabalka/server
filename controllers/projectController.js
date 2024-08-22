const router = require('express').Router();

const auth = require('../middlewares/auth');
const { isAuth, isOwner } = require('../middlewares/guards');
const preload = require('../middlewares/preloads');
const { create,getAll,getById,remove,update, getCollectionLength, findByOwner } = require('../services/projects');
const { parseError } = require('../util');

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    // if there is no _ownerId in the query it will be undefined therefore the check below
    const ownerId = req.query._ownerId;
    const query = {};

    try {
        let projects, totalProjects;
        // checking if ownerId is undefined
        if (ownerId) {
            const result = await findByOwner(ownerId, page, pageSize);
            projects = result.projects;
            totalProjects = result.totalProjects;
        }else {
            projects = await getAll(query, page, pageSize);
            totalProjects = await getCollectionLength(query);
        }
        res.json({ projects, totalProjects });

    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ message: err.message });
        } else {
            console.error('Response already sent:', err);
        }
    }
});

router.post('/', auth(), isAuth(), async (req, res) => {
    const data = {
        title: req.body.title,
        description: req.body.description,
        // img: {type: String, required: [true, 'Image URL is required!']},
        language: req.body.language,
        code: req.body.code,
        // date: new Date(req.body.date),
        owner: req.user._id,
    };
    try{
        const project = await create(data);
    
        res.status(201).json({ success: true, data: project});
    } catch(err){
        const message = parseError(err);
        res.status(err.status || 400).json({message});
    }
});

router.get('/:id', preload(), async (req, res) => {
    const project = await getById(req.params.id);
    const ownerId = project.owner.toString();
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 2;
    try {
        const { projects, totalProjects } = await findByOwner(ownerId, page, pageSize);
        res.json({ project, projects, totalProjects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/projects/:id', auth(), isAuth(), async (req, res) => {
    const userId = req.user._id;
    try{
        const { projects, totalProjects }  = await findByOwner(userId);
        res.json({ projects, totalProjects });
    } catch (err){
        const message = parseError(err);
        console.error('Error finding projects for user., projectController ln 81:', err);
        res.status(500).json({ message });
    }
})

router.put('/:id', auth(), isAuth(), preload(), isOwner(), async (req, res) => {
    const updated = {
        title: req.body.title,
        description: req.body.description,
        language: req.body.language,
        // img: {type: String, required: [true, 'Image URL is required!']},
        code: req.body.code,
        // dateDiscovered: req.body.dateDiscovered
    };

    try{
        const updatedProject = await update(req.data, updated);

        res.json(updatedProject);
    } catch(err){
        const message = parseError(err);
        res.status(err.status || 400).json({ message });
    }
})

router.put('/adminOwned/:id', auth(), preload(), async (req, res) => {
    const updated = {
        title: req.body.title,
        description: req.body.description,
        language: req.body.language,
        // img: {type: String, required: [true, 'Image URL is required!']},
        code: req.body.code,
        owner: req.body.owner
        // dateDiscovered: req.body.dateDiscovered
    };

    try{
        const updatedProject = await update(req.data, updated);

        res.json(updatedProject);
    } catch(err){
        const message = parseError(err);
        res.status(err.status || 400).json({ message });
    }
})

router.delete('/:id', isAuth(), preload(), isOwner(), async (req, res) => {
    try{
        await remove(req.params.id);
        res.status(204).end();
    } catch(err){
        res.status(err.status || 400).json({ message: err.message });
    }
});

module.exports = router;

