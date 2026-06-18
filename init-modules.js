const fs = require('fs');
const path = require('path');

const modules = ['members', 'vehicles', 'requests', 'concierge'];
const basePath = path.join(__dirname, 'src', 'modules');

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

modules.forEach(mod => {
  const modPath = path.join(basePath, mod);
  if (!fs.existsSync(modPath)) {
    fs.mkdirSync(modPath, { recursive: true });
  }

  // Controller
  fs.writeFileSync(path.join(modPath, `${mod}.controller.js`), `
const ${mod}Service = require('./${mod}.service');

exports.getAll = async (req, res, next) => {
  try {
    const data = await ${mod}Service.getAll();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await ${mod}Service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
  `.trim());

  // Service
  const modelName = mod.charAt(0).toUpperCase() + mod.slice(1, -1); // Simple singularization
  let serviceMethods = `
const { ${modelName} } = require('../../../models');

exports.getAll = async () => {
  return await ${modelName}.findAll();
};

exports.create = async (data) => {
  return await ${modelName}.create(data);
};
  `;


  if (mod === 'requests') {
    serviceMethods += `
exports.updateLifecycle = async (id, status) => {
  const validStatuses = ['Requested', 'Accepted', 'In Progress', 'Completed'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  // TODO: Update in DB
  return { id, status };
};
    `;
  }

  fs.writeFileSync(path.join(modPath, `${mod}.service.js`), serviceMethods.trim());

  // Routes
  let routeContent = `
const express = require('express');
const router = express.Router();
const ${mod}Controller = require('./${mod}.controller');

/**
 * @swagger
 * /api/${mod}:
 *   get:
 *     summary: Get all ${mod}
 *     tags: [${mod.charAt(0).toUpperCase() + mod.slice(1)}]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', ${mod}Controller.getAll);

/**
 * @swagger
 * /api/${mod}:
 *   post:
 *     summary: Create new ${mod}
 *     tags: [${mod.charAt(0).toUpperCase() + mod.slice(1)}]
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', ${mod}Controller.create);
  `;

  if (mod === 'requests') {
    routeContent += `
/**
 * @swagger
 * /api/${mod}/{id}/status:
 *   patch:
 *     summary: Update request lifecycle status
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Requested, Accepted, In Progress, Completed]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const data = await require('./requests.service').updateLifecycle(req.params.id, req.body.status);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});
    `;
  }
  routeContent += `\nmodule.exports = router;`;

  fs.writeFileSync(path.join(modPath, `${mod}.routes.js`), routeContent.trim());
});

console.log('Modules created successfully');
