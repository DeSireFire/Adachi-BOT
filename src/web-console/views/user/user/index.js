const template = `<div class="table-container user">
	<div class="nav-btn-box">
    	<el-scrollbar class="horizontal-wrap">
			<nav-search :searchList="searchList" :searchData="listQuery" :showNum="1" :disabled="tableLoading" @change="handleFilter">
				<el-button type="primary" :disabled="selectionList.length === 0" round @click="removeUserBatch">删除用户</el-button>
			</nav-search>
    	</el-scrollbar>
	</div>
    <div class="table-view">
		<el-table v-loading="tableLoading" :data="userList" header-row-class-name="table-header" :height="tableHeight" stripe @selection-change="selectionChange">
			<el-table-column fixed="left" type="selection" width="50" align="center" prop="selection" label="筛选"></el-table-column>
			<el-table-column prop="userID" label="QQ" align="center" min-width="110px"></el-table-column>
			<el-table-column prop="avatar" label="用户" align="center" min-width="230px">
				<template #default="{row}">
					<div class="user-info">
						<img class="user-avatar" :src="row.avatar" alt="ERROR" draggable="false" />
						<span class="user-nickname">{{ row.nickname }}</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="botAuth" label="权限" align="center" min-width="100px">
				<template #default="{row}">
					<div class="lighter-block" :style="{ 'background-color': authLevel[row.botAuth].color }">
						<span>{{ authLevel[row.botAuth].label }}</span>
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="subInfo" label="订阅数" align="center" min-width="65px">
				<template #default="{row}">
					<span>{{ row.subInfo.length }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="isFriend" label="好友" align="center" min-width="60px">
				<template #default="{row}">
					<span :style="{ color: row.isFriend ? '#55db2c' : '#ff0000' }">{{ row.isFriend ? "是" : "否" }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="setting" label="操作" align="center" min-width="110px">
				<template #default="{row}">
    	      		<el-button v-if="row.subInfo.length" type="text" @click="removeSub(row.userID)">取消订阅</el-button>
    	      		<el-button type="text" @click="openUserModal(row)">编辑</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			v-model:current-page="currentPage"
			layout="prev, pager, next"
			:page-size="pageSize"
			:pager-count="7"
			:total="totalUser"
			@current-change="getUserData"></el-pagination>
	</div>
	<user-detail
		ref="userDetailRef"
		:user-info="selectUser"
		:cmdKeys="cmdKeys"
		:auth-level="authLevel"
		@close-dialog="resetCurrentData"
		@reload-data="getUserData"
	></user-detail>
</div>`;

import $http from "../../../api/index.js";
import NavSearch from "../../../components/nav-search/index.js";
import UserDetail from "./user-detail.js";

const { defineComponent, reactive, onMounted, computed, ref, toRefs, inject } = Vue;
const { ElNotification, ElMessageBox } = ElementPlus;

export default defineComponent( {
	name: "User",
	template,
	components: {
		NavSearch,
		UserDetail
	},
	setup() {
		const state = reactive( {
			userList: [],
			cmdKeys: [],
			currentPage: 1,
			pageSize: 14,
			totalUser: 0,
			tableLoading: false,
			showUserModal: false,
			selectUser: {},
			// 所选列表数组
			selectionList: []
		} );
		
		const userDetailRef = ref( null );
		
		const { device, deviceWidth, deviceHeight, showTab } = inject( "app" );
		
		const subOptions = [
			{ label: "已订阅", value: 1 },
			{ label: "未订阅", value: 2 },
		];
		
		const searchList = ref( [
			{ id: 'userId', name: 'QQ', type: 'input', placeholder: 'qq号' },
			{
				id: 'sub',
				name: '订阅',
				type: 'select',
				itemList: subOptions,
				placeholder: "是否存在订阅"
			}
		] );
		
		const listQuery = reactive( {
			userId: "",
			sub: ""
		} );
		
		const authLevel = [ {
			label: "Banned",
			color: "#727272",
			value: 0
		}, {
			label: "User",
			color: "#55db2c",
			value: 1
		}, {
			label: "Manager",
			color: "#31c0c2",
			value: 2
		}, {
			label: "Master",
			color: "#ff0000",
			value: 3
		} ];
		
		const tableHeight = computed( () => {
			return `${ deviceHeight.value - ( device.value === "mobile" ? 240 : 240 ) - ( showTab.value ? 40 : 0 ) }px`;
		} );
		
		onMounted( () => {
			getUserData();
		} )
		
		function getUserData() {
			state.tableLoading = true;
			$http.USER_LIST( {
				page: state.currentPage,
				length: state.pageSize,
				...listQuery
			}, "GET" ).then( resp => {
				state.userList = resp.data.userInfos;
				state.cmdKeys = resp.data.cmdKeys;
				state.totalUser = resp.total;
				state.tableLoading = false;
			} ).catch( error => {
				state.tableLoading = false;
			} );
		}
		
		/* 筛选条件变化查询 */
		async function handleFilter() {
			state.currentPage = 1;
			await getUserData();
		}
		
		async function removeSub( userId ) {
			try {
				await ElMessageBox.confirm( "确定移除该用户所有订阅服务？", '提示', {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning",
					center: true
				} )
			} catch ( error ) {
				return;
			}
			state.tableLoading = true;
			$http.USER_SUB_REMOVE( { userId }, "POST" ).then( async () => {
				getUserData()
				ElNotification( {
					title: "成功",
					message: "取消该用户订阅服务成功。",
					type: "success",
					duration: 2000
				} );
			} ).catch( () => {
				state.tableLoading = false;
			} )
		}
		
		async function removeUserBatch() {
			try {
				await ElMessageBox.confirm( "删除用户将会清空其订阅并解除好友关系，是否继续？", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					type: "warning",
					center: true
				} )
			} catch ( error ) {
				return;
			}
			state.tableLoading = true;
			$http.USER_REMOVE_BATCH( {
				userIds: state.selectionList.map(s => s.userID)
			}, "POST" ).then( () => {
				getUserData();
				ElNotification( {
					title: "成功",
					message: "删除用户成功。",
					type: "success",
					duration: 2000
				} );
			} ).catch( () => {
				state.tableLoading = false;
			} );
		}
		
		function selectionChange( val ) {
			state.selectionList = val
		}
		
		function openUserModal( row ) {
			state.selectUser = JSON.parse( JSON.stringify( row ) );
			userDetailRef.value.openModal();
		}
		
		function resetCurrentData() {
			state.selectUser = {};
		}
		
		return {
			...toRefs( state ),
			userDetailRef,
			tableHeight,
			deviceWidth,
			deviceHeight,
			listQuery,
			authLevel,
			searchList,
			getUserData,
			handleFilter,
			removeSub,
			removeUserBatch,
			selectionChange,
			openUserModal,
			resetCurrentData
		};
	}
} );