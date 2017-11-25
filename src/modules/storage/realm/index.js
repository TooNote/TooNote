// @ts-check
/* global TEST */
import path from 'path';
import Realm from 'realm';
import ConfigSchema from './schema/Config';
import NotebookSchema from './schema/Notebook';
import CategorySchema from './schema/Category';
import NoteSchema from './schema/Note';
import idGen from '../../util/idGen';
const SCHEMA_VERSION = 1;

let filename = 'toonote.realm';
if(TEST){
	filename = 'toonote.test.realm';
}
if(DEBUG){
	filename = 'toonote.debug.realm';
}
const DB_PATH = path.join(require('electron').remote.app.getPath('userData'), filename);

let realm;

function initData(){
	// 新建第一个笔记本
	const notebookList = getResults('Notebook');
	if(!notebookList.length){
		let now = new Date();
		updateResult('Notebook', {
			id: idGen(),
			title: '默认笔记',
			order: 1,
			createdAt: now,
			updatedAt: now,
			categories: [],
			notes: []
		});
	}
}

/**
 * 初始化realm数据库
 */
export async function init(){
	await Realm.open({
		schema: [ConfigSchema, NotebookSchema, CategorySchema, NoteSchema],
		schemaVersion: SCHEMA_VERSION,
		path: DB_PATH
	}).then((realmInstance) => {
		realm = realmInstance;
		// 初始化数据
		initData();
	});
}

/**
 * 获取某个Schema的结果
 * @param {string} name Schema名称
 * @returns {Realm.Results} Schema结果
 */
export function getResults(name){
	return realm.objects(name);
}

/**
 * 更新数据
 * @param {string} name Schema名称
 * @param {Object|Array<Object>} arr 新数据
 */
export function updateResult(name, arr){
	realm.write(() => {
		if(!Array.isArray(arr)) arr = [arr];
		arr.forEach((obj) => {
			// 当主键相同时，第三个参数会覆盖已有记录
			realm.create(name, obj, true);
		});
	});
}
