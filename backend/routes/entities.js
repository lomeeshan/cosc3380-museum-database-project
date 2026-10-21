const express = require('express');
const db = require('../db/connection');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();


const settings = {
  artists: { table: 'ARTIST', pk: 'ArtistID', fields: ['ArtistName','BirthYear','DeathYear','Nationality','Biography'], required: ['ArtistName'], writeRoles: ['Admin','Curator'] },
  collections: { table: 'COLLECTION', pk: 'CollectionID', fields: ['CollectionName','Description'], required: ['CollectionName'], writeRoles: [] },
  galleries: { table: 'GALLERY', pk: 'GalleryID', fields: ['GalleryName','Capacity','AccessibilityNotes'], required: ['GalleryName'], writeRoles: [] },
  artworks: { table: 'ARTWORK', pk: 'ArtworkID', fields: ['CollectionID','AccessionNumber','Title','CreationYear','Medium','Dimensions','Description'], required: ['CollectionID','AccessionNumber','Title','Medium'], writeRoles: ['Admin','Curator'] },
  exhibitions: { table: 'EXHIBITION', pk: 'ExhibitionID', fields: ['GalleryID','ExhibitionTitle','StartDate','EndDate','Description','Status'], required: ['GalleryID','ExhibitionTitle','StartDate','EndDate','Status'], writeRoles: ['Admin','Curator'] },
  visitors: { table: 'VISITOR', pk: 'VisitorID', fields: ['FirstName','LastName','Email','Phone'], required: ['FirstName','LastName'], writeRoles: ['Admin','Sales Staff'] },
  products: { table: 'GIFTSHOP_PRODUCT', pk: 'ProductID', fields: ['ProductName','Category','CurrentPrice','QuantityInStock','IsActive'], required: ['ProductName','Category','CurrentPrice','QuantityInStock','IsActive'], writeRoles: ['Admin','Sales Staff'] }
};
const numeric = new Set(['BirthYear','DeathYear','CollectionID','GalleryID','CreationYear','Capacity','CurrentPrice','QuantityInStock','IsActive']);

function config(req, res, next) {
  const c = settings[req.params.entity];
  if (!c) return res.status(404).json({ error: 'Unknown resource' });
  req.entityConfig = c;
  next();
}
function validate(c, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid form data');
  const record = {};
  for (const field of c.fields) {
    let value = input[field] === '' || input[field] === undefined ? null : input[field];
    if (c.required.includes(field) && (value === null || String(value).trim() === '')) {
      throw new Error(`${field} is required`);
    }
    if (value !== null && numeric.has(field)) {
      if (typeof value === 'boolean') value = Number(value);
      value = Number(value);
      if (!Number.isFinite(value)) throw new Error(`${field} must be a number`);
      if (field === 'IsActive' && ![0,1].includes(value)) throw new Error('IsActive must be 0 or 1');
    } else if (value !== null) value = String(value).trim();
    record[field] = value;
  }
  if (c.table === 'EXHIBITION' && record.EndDate < record.StartDate) throw new Error('End date cannot be before start date');
  return record;
}

router.use(requireLogin);
router.get('/:entity', config, async (req,res,next)=>{
  try {
    const c = req.entityConfig;
    const [rows] = await db.query(`SELECT * FROM ${c.table} ORDER BY ${c.pk} DESC LIMIT 250`);
    res.json(rows);
  } catch(e) { next(e); }
});
router.get('/:entity/:id', config, async (req,res,next)=>{
  const c = req.entityConfig;
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:'Invalid record ID'});
  try {
    const [rows] = await db.execute(`SELECT * FROM ${c.table} WHERE ${c.pk} = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({error:'Record not found'});
    res.json(rows[0]);
  } catch(e){next(e);}
});
router.post('/:entity', config, async (req,res,next)=>{
  const c=req.entityConfig;
  if (!c.writeRoles.includes(req.user.role)) return res.status(403).json({error:'Permission denied'});
  let record;
  try { record=validate(c,req.body); } catch(e) {return res.status(400).json({error:e.message});}
  try {
    const placeholders=c.fields.map(()=>'?').join(',');
    const [result]=await db.execute(`INSERT INTO ${c.table} (${c.fields.join(',')}) VALUES (${placeholders})`,c.fields.map(f=>record[f]));
    res.status(201).json({message:'Record added',id:result.insertId});
  } catch(e){next(e);}
});
router.put('/:entity/:id',config,async(req,res,next)=>{
  const c=req.entityConfig;
  if (!c.writeRoles.includes(req.user.role)) return res.status(403).json({error:'Permission denied'});
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:'Invalid record ID'});
  let record;
  try {record=validate(c,req.body);}catch(e){return res.status(400).json({error:e.message});}
  try {
    const sets=c.fields.map(f=>`${f} = ?`).join(', ');
    const [result]=await db.execute(`UPDATE ${c.table} SET ${sets} WHERE ${c.pk} = ?`,[...c.fields.map(f=>record[f]),req.params.id]);
    if (!result.affectedRows) return res.status(404).json({error:'Record not found'});
    res.json({message:'Record updated'});
  }catch(e){next(e);}
});
router.delete('/:entity/:id',config,async(req,res,next)=>{
  const c=req.entityConfig;
  if (!c.writeRoles.includes(req.user.role)) return res.status(403).json({error:'Permission denied'});
  if (!/^\d+$/.test(req.params.id)) return res.status(400).json({error:'Invalid record ID'});
  try {
    if (c.table === 'GIFTSHOP_PRODUCT') {
      const [result]=await db.execute('UPDATE GIFTSHOP_PRODUCT SET IsActive = 0 WHERE ProductID = ?', [req.params.id]);
      if (!result.affectedRows) return res.status(404).json({error:'Record not found'});
      return res.json({message:'Product deactivated (soft delete)'});
    }
    const [result]=await db.execute(`DELETE FROM ${c.table} WHERE ${c.pk} = ?`,[req.params.id]);
    if (!result.affectedRows) return res.status(404).json({error:'Record not found'});
    res.json({message:'Record deleted'});
  }catch(e){next(e);}
});
module.exports=router;
