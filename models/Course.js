const HttpError = require('http-errors');

const { db } = require('../services/database');
const { whereParams } = require('../services/sqltools');

// if found return { ... }
// if not found return {}
// if db error, db.query will throw a rejected promise
async function findOne(id) {
	if (id) {
		const { text, params } = whereParams({
			id: id,
		});

		const res = await db.query(`SELECT * from "course" ${text} LIMIT 1;`, params);
		if (res.rows.length > 0) {
			return res.rows[0];
		}
	} else {
		throw HttpError(400, 'Id is required.');
	}

	return {};
}

// if successful delete, return course was deleted
async function deleteCourse(id) {
	// check that id is not nullable
	if (id) {
		const { text, params } = whereParams({
			id: id,
		});

		const res = await db.query(`DELETE FROM "course" ${text};`, params);
		if (res.rows.length > 0) {
			return true;
		}
	} else {
		throw HttpError(400, 'Id is required.');
	}
}

/**
 * Adds course to database
 *
 * @param  {Number} courseId
 * @param  {String} department
 * @param  {String} number
 * @param  {String} id
 * @param  {String} credits
 *
 * @returns {object} course object if successfully returned
 *
 * if adding duplicate throws 500 error 'Course already added;'
 * if course types are not compatable, throws 500 error 'Incompatable Course Parameter Types'
 * if any paramters are null, throw a 500 error 'Missing Course Paramters'
 */
async function addCourse(courseId, department, number, id, credits) {
	if (courseId && department && number && id && credits) {
		if (
			typeof courseId === 'number' &&
			typeof department === 'string' &&
			typeof number === 'string' &&
			typeof id === 'string' &&
			typeof credits === 'string'
		) {
			if (findOne({ courseId })) {
				console.table({
					courseId: courseId,
					department: department,
					number: number,
					id: id,
					credits: credits,
				});
				throw HttpError(500, 'Course already addded');
			}

			const res = await db.query(
				`INSERT INTO (courseId, department, number, id, credits courses) VALUES (${courseId}, ${department}, ${number}, ${id}, ${credits})`
			);

			if (!res) {
				throw HttpError(500, 'Error adding course');
			}

			return res.rows[0];
		} else {
			throw HttpError(500, 'Incompatable Course Parameter Types');
		}
	} else {
		throw HttpError(500, 'Missing Course Parameters');

	}
}

async function count() {
	const res = await db.query(`SELECT COUNT(*) FROM "course"`);

	if (res.rows.length > 0) {
		return res.rows[0];
	} else {
		throw HttpError(500, 'Some Error Occurred');

	}
}

module.exports = {
	findOne,
	addCourse,
	deleteCourse,
	count
};
