const express = require("express");
const pool = require("../config");
const multer = require('multer');
const router = express.Router();
const path = require("path")
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './static/uploads') // path to save file
    },
    filename: function (req, file, callback) {
        // set file name
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })

// Get comment
router.get('/:blogId/comments', function (req, res, next) {
});

// Create new comment
router.post('/:blogId/comments', upload.single('comment_image'), async function (req, res, next) {

    const file = req.file;
    if (!file) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
    }

    const conn = await pool.getConnection()
    // Begin transaction
    await conn.beginTransaction();

    try {
        let results = await conn.query(
            "INSERT INTO comments(blog_id, comment, comment_date,comment_by_id) VALUES(?, ?,CURRENT_TIMESTAMP,?);",
            [req.params.blogId, req.body.comment ,req.body.comment_by_id]
        )
        const blogId = results[0].insertId;

        await conn.query(
            "INSERT INTO images(blog_id, file_path,comment_id) VALUES(?, ?, ?);",
            [-1, file.path.substr(6),results[0].insertId])

        await conn.commit()
        res.redirect('/blogs/'+req.params.blogId)
    } catch (err) {
        await conn.rollback();
        next(err);
    } finally {
        console.log('finally')
        conn.release();
    }

});
// Update comment
router.put('/comments/:commentId', async function (req, res, next) {
    const { comment, like, comment_date, comment_by_id, blog_id } = req.body
    const [rows, fields] = await pool.query(`UPDATE comments SET comments.comment=?,comments.like=?,comments.comment_date=?,comments.comment_by_id=?,comments.blog_id=? WHERE comments.id=?`,
        [comment, like, comment_date, comment_by_id, blog_id, req.params.commentId])
    res.json({
        "message": `Comment ID ${req.params.commentId} is updated.`,
        "comment": {
            "comment": "edit comment",
            "like": 0,
            "comment_date": "2021-12-31",
            "comment_by_id": null,
            "blog_id": 1
        }
    })
});

// Delete comment
router.delete('/comments/:commentId', async function (req, res, next) {
    const [rows, fields] = await pool.query(`DELETE FROM comments WHERE id=?`,
        [req.params.commentId])
    res.json({
        "message": `Comment ID ${req.params.commentId} is deleted.`
    })
});

// addlike comment
router.put('/comments/addlike/:commentId', async function (req, res, next) {
    const [rows, fields] = await pool.query("SELECT * FROM comments WHERE id=?", [
        req.params.commentId,
    ]);
    if (rows.length != 0) {
        let likeNum = rows[0].like
        let blog = rows[0].blog_id
        likeNum += 1

        //Update จำนวน Like กลับเข้าไปใน DB
        const [rows2, fields2] = await pool.query("UPDATE comments SET comments.like=? WHERE comments.id=?",
            [likeNum, req.params.commentId]);

        res.json({
            "blogId": blog,
            "commentId": req.params.commentId,
            "likeNum": likeNum
        })
    }
    else {
        res.send("ไม่มีข้อมูล")
    }
});


exports.router = router