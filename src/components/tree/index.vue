<template>
  <div
    class="ql-tree"
    :class="{
      'ql-tree-select': mode === 'select',
      'ql-tree-edit': mode === 'edit',
      'is-current-style': mode !== 'select' && !$attrs['show-checkbox'],
      checkable: $attrs['show-checkbox']
    }"
  >
    <tree
      ref="tree"
      node-key="id"
      :data="formatData"
      :show-checkbox="$attrs['show-checkbox']"
      :draggable="draggable"
      :props="treeProps"
      :default-expanded-keys="$attrs['default-expanded-keys']"
      :default-checked-keys="$attrs['default-checked-keys']"
      :lazy="$attrs.lazy"
      :load="$attrs.load"
      :allow-drop="$attrs['allow-drop']"
      @node-drag-start="startDrop"
      @node-drop="nodeDrop"
      @node-click="clickNode"
      @check="$emit('check')"
      @check-change="checkChange"
    >
      <div
        slot-scope="{ node, data }"
        :class="['ql-tree-node', { 'is-editing': data.id === editingId }]"
        @click="judgePop(node)"
      >
        <div
          class="dis-flex align-center"
          @dblclick="changeNodeStatus(data, node)"
          style="justify-content: space-between;white-space:normal;"
        >
          <div class="node-title ellipsis-1">
            <span
              v-if="data.id !== editingId"
              :title="data.name"
              :class="{
                isSelected:
                  mode === 'select' &&
                  selectedNodeList.map(x => x.id).includes(data.id)
              }"
            >{{ data.name || "&nbsp;" }}</span>
            <input
              v-else
              v-model="editingName"
              ref="input"
              @blur="editingEnd"
              @keyup.enter="e => e.target.blur()"
              @click.stop="() => {}"
              @mousedown="nodeDraggable = false"
              @mouseup="nodeDraggable = true"
              :draggable="false"
              placeholder="请输入节点名称"
            />
          </div>
          <!-- edit -->
          <div class="node-options" v-if="showOptions(data, 'all')">
            <!-- 这里的dblclick.stop为必需，阻止双击事件冒泡 -->
            <span
              class="icon el-icon-plus"
              :title="showOptions(data, 'addTitle')"
              @click.stop="addNewNode(data, node)"
              @dblclick.stop="() => {}"
              v-if="showOptions(data, 'add')"
            ></span>
            <span
              class="icon chapter_ic_edit"
              title="编辑"
              @click.stop="changeNodeStatus(data, node)"
              @dblclick.stop="() => {}"
              v-if="showOptions(data, 'edit')"
            ></span>
            <span
              class="icon el-icon-delete"
              title="删除"
              @click.stop="clickDelete(data, node)"
              @dblclick.stop="() => {}"
              v-if="showOptions(data, 'delete')"
            ></span>
          </div>
          <!-- select -->
          <div
            v-if="
              mode === 'select' &&
                selectedNodeList.map(x => x.id).includes(data.id)
            "
          >
            <span class="icon icon-resource_selected"></span>
          </div>
        </div>
      </div>
    </tree>
  </div>
</template>
<script>
import { Tree } from "element-ui";

export default {
  name: "ql-tree",
  components: {
    Tree
  },
  inheritAttrs: false,
  props: {
    // 树的原始数据，即从接口请求回来的原始数据
    treeData: {
      type: Array,
      required: true
    },
    // 树的类型
    // edit用于编辑，show用于展示，select 用于选择相关，可以多选
    mode: {
      type: String,
      default: "show"
    },

    /**
     * @desc 新增按钮文字
     * @example
     * [String] '新增节点'
     * [Function] node => node.level === 1 ? "新增子节点" : "新增父节点"
     */
    addBtnText: {
      type: [String, Function],
      default: "新增节点"
    },
    /**
     * @desc 节点工具栏按钮显示控制
     * 属性可为Boolean或Function
     * @example
     * [Boolean] { add: true }
     * [Function] { add: node => node.level > 1 }
     * 不传则默认显示
     */
    btnVisible: {
      type: Object,
      default: () => {
        return {
          add: true,
          edit: true,
          delete: true
        };
      }
    },

    // 默认选中的节点数组
    selectedList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      //树的配置
      treeProps: {
        alias: "",
        label: "name",
        children: "children",
        isLeaf: data => !data.isOpen // 指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效
      },

      // mode: edit
      //编辑相关参数
      editingName: "", //编辑中的名字
      editingId: "", //编辑中的id
      editingNode: null,

      //记录被拖拽的节点位置
      draggingNode: {
        nextSibling: null,
        previousSibling: null,
        parent: null
      },

      // 节点是否可拖拽 用来阻止编辑节点时拖拽
      nodeDraggable: true,

      // 删除空节点确认弹窗是否显示 用于新增节点时限制弹窗个数
      confirmDialog: false,

      // mode: select
      //记录被选中的节点
      selectedNodeList: []
    };
  },
  computed: {
    //排序转换后的数据
    formatData() {
      const cloneDeepList = JSON.parse(JSON.stringify(this.treeData));
      // 章节目录为"全部"的节点
      const parentNode = this.treeData.find(
        x => x.pid === null || x.pid === ""
      );

      return cloneDeepList.length
        ? parentNode
          ? [handleTreeNode(parentNode, cloneDeepList)]
          : handleTreeNode(
              {
                id: 0,
                level: 0
              },
              cloneDeepList
            ).children
        : [];

      // 通过递归将子节点按seq排序放入父节点的children属性中
      function handleTreeNode(node, list) {
        let filterList = list.filter(x => String(x.pid) === String(node.id));
        if (filterList && filterList.length) {
          node.children = filterList.sort((a, b) => a.seq - b.seq);
          for (let i = 0; i < node.children.length; i++) {
            let n = node.children[i];
            n.level = node.level + 1;
            n = handleTreeNode(n, list);
          }
        } else {
          return { children: [] };
        }
        return node;
      }
    },
    // 节点是否可拖拽
    draggable() {
      return this.mode === "edit" && this.nodeDraggable;
    }
  },
  watch: {
    selectedList: function(newV) {
      this.selectedNodeList = [].concat(newV);
    }
  },
  methods: {
    /**************** 暴露给父组件使用的方法 ******************/
    /**
     * @desc 返回目前半选中的节点所组成的数组
     * @returns {function}
     */
    getHalfCheckedNodes() {
      return this.$refs.tree.getHalfCheckedNodes();
    },
    /**
     * @desc 返回目前被选中的节点所组成的数组
     * @returns {function}
     */
    getCheckedNodes() {
      return this.$refs.tree.getCheckedNodes();
    },
    /**
     * @desc 设置目前勾选的节点
     * @param {array} keys 勾选节点的 key 的数组
     * @param {boolean} leafOnly 若为true则仅设置叶子节点的选中状态
     * @returns {function}
     */
    setCheckedKeys(keys, leafOnly = false) {
      return this.$refs.tree.setCheckedKeys(keys, leafOnly);
    },
    /**
     * @desc 设置某个节点的当前选中状态
     * @param {number} key  待被选节点的 key，若为 null 则取消当前高亮的节点
     * @returns {function}
     */
    setCurrentKey(key) {
      return this.$refs.tree.setCurrentKey(key);
    },
    /**
     * @desc 返回被选中节点数组
     * @returns {array}
     */
    submitSelectList() {
      const ids = this.treeData.map(item => item.id);
      return [].concat(this.selectedNodeList).filter(x => ids.includes(x.id));
    },

    /********************* 通用BEGIN **********************/
    /**
     * @desc 节点点击事件
     * 事件冒泡 judgePop -> tree自带节点点击事件 -> 点击事件回调: clickNode
     * elementUI的Tree组件自带节点点击事件(展开->收起)
     * @param {object} node 节点
     */
    judgePop(node) {
      const e = e || event;
      if (!node.data.children || !node.data.children.length) {
        this.$emit("selectNode", node.data);
        this.$refs.tree.setCurrentKey(node.data.id);
      }

      // 当节点已展开并且有子节点时 阻止事件冒泡，从而阻止节点收起
      // if (node.expanded && node.data.children) {
      //   e.stopPropagation();
      // }
    },
    /**
     * @desc 节点被点击后的回调
     * @param {object} data 节点数据
     * @param {object} node 节点
     * @param {object} component 节点组件本身
     */
    clickNode(data, node, component) {
      // select 模式下，显示选中样式
      if (this.mode === "select") {
        if (node.isLeaf) {
          if (this.selectedNodeList.map(x => x.id).includes(data.id)) {
            // 选中情况： 去掉选中状态
            const index = this.selectedNodeList.findIndex(
              x => x.id === data.id
            );
            this.selectedNodeList.splice(index, 1);
          } else {
            // 未选中： 选中
            this.selectedNodeList.push(data);
          }
        }
      }
    },

    // check
    checkChange() {
      // 只传叶子节点
      this.$emit("check-change", this.$refs.tree.getCheckedNodes(true));
    },

    /********************* 通用END **********************/

    /********************* 编辑BEGIN **********************/
    /**
     * @desc 增加、编辑、删除按钮显示控制
     * @param {object} data 节点数据
     * @param {string} type 判断类型
     * @returns {number|string}
     */
    showOptions(data, type) {
      // 树的类型不为edit或节点处于编辑状态时隐藏
      if (this.mode !== "edit" || data.id === this.editingId) return false;

      switch (type) {
        // 全部按钮显示控制 版本课本可编辑
        case "all":
          return true;
        // "删除"、"编辑"按钮显示控制 版本、课本可删除/编辑
        case "delete":
        case "edit":
        case "add":
          const isShow = this.btnVisible[type];
          // 没传则默认显示
          return typeof isShow === "undefined"
            ? true
            : typeof isShow === "boolean"
            ? !!isShow
            : isShow(data);
        // "新增"按钮title
        case "addTitle":
          return typeof this.addBtnText === "string"
            ? this.addBtnText
            : this.addBtnText(data) || "新增节点";
        default:
          return false;
      }
    },

    /************************ 拖拽相关 ***********************/
    /**
     * @desc 节点开始拖拽时触发的事件
     * @param {object} node 被拖拽节点对应的节点
     * @param {object} event 拖拽事件状态
     */
    startDrop(node, event) {
      const treeNode = this.$refs.tree.getNode(node.data.id);
      this.draggingNode.nextSibling = treeNode.nextSibling;
      this.draggingNode.previousSibling = treeNode.previousSibling;
      this.draggingNode.parent = treeNode.parent;
    },
    /**
     * @desc 拖拽成功完成时触发的事件
     * @param {object} node 被拖拽节点对应的节点
     * @param {object} desNode 结束拖拽时最后进入的节点
     * @param {string} pos 被拖拽节点的放置位置
     * @enum [before] 向上移动
     * @enum [after] 向下移动
     * @enum [inner] 移动至某个节点的子节点
     * @param {object} event 拖拽事件状态
     */
    async nodeDrop(node, desNode, pos, event) {
      const { data } = node;
      const { data: desData } = desNode;

      // let query = {
      //   id: node.id,
      //   newPid: "",
      //   newSeq: "",
      // };
      // if (pos === "inner") {
      //   query.newPid = desNode.id;
      //   if (desNode.children.length > 1) {
      //     query.newSeq = desNode.children[desNode.children.length - 1].seq + 1;
      //   } else {
      //     query.newSeq = 0;
      //   }
      // } else if (pos === "before") {
      //   query.newSeq = desNode.seq;
      //   query.newPid = desNode.pid;
      // } else if (pos === "after") {
      //   query.newSeq = desNode.seq + 1;
      //   query.newPid = desNode.pid;
      // }

      this.$emit(
        "node-drop",
        data, // 被拖拽节点数据
        desData, // 结束拖拽时最后进入的节点数据
        pos, // 被拖拽节点的放置位置
        resolve.bind(this), // 拖拽成功回调 必须调用
        reject.bind(this) // 拖拽失败回调 必须调用
      );

      function resolve(res) {
        if (res.status === 0) {
          // 更新节点的信息
          if (pos === "inner") {
            data.pid = desData.id;
            data.seq =
              desNode.children.length > 1
                ? desNode.children[desNode.children.length - 1].seq + 1
                : 0;
          } else if (pos === "before") {
            data.pid = desData.pid;
            data.seq = desData.seq;
          } else if (pos === "after") {
            data.pid = desData.pid;
            data.seq = desData.seq;
          }
        } else {
          reject.apply(this);
        }
      }

      function reject() {
        // 移除原来的节点
        this.$refs.tree.remove(data);
        // 在相应的位置插入节点
        if (this.draggingNode.previousSibling) {
          this.$refs.tree.insertAfter(data, this.draggingNode.previousSibling);
        } else if (this.draggingNode.nextSibling) {
          this.$refs.tree.insertBefore(data, this.draggingNode.nextSibling);
        } else if (this.draggingNode.parent) {
          this.$refs.tree.append(data, this.draggingNode.parent);
        }
      }
    },

    /********************* 新增、删除、编辑相关 ************************/
    /**
     * @desc 新增节点
     * @param {object} data 节点数据
     * @param {object} node 节点
     */
    addNewNode(data, node) {
      if (this.editingId) {
        this.$refs.input.focus();
        return;
      }
      const appendData = {
        id: -1,
        level: (data && data.level + 1) || 0,
        name: "",
        pid: (data && data.id) || 0,
        seq: data
          ? data.children
            ? data.children.length
            : 0
          : this.formatData.length
      };

      // 自动展开节点
      if (node && !node.expanded) {
        node.expanded = true;
      }
      // 为node节点追加一个子节点
      this.$refs.tree.append(appendData, node);

      this.editingNode = this.$refs.tree.getNode(appendData).data;
      this.editingId = -1;

      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.input.focus();
        }, 100);
      });
    },
    /**
     * @desc 编辑节点
     * @param {object} data 节点数据
     * @param {object} node 节点
     */
    changeNodeStatus(data, node) {
      // 节点被双击时也会触发该函数，因此需排除mode不为edit的情况
      if (this.mode !== "edit") return;
      if (this.editingId === data.id) return;

      this.editingName = data.name;
      this.editingId = data.id;
      this.editingNode = data;

      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    /**
     * @desc input失焦事件 编辑结束
     */
    editingEnd() {
      let value = this.editingName.replace(/\s/g, "");
      if (!value) {
        // 数据为空 删除
        this.clickDelete();
      } else {
        this.$emit(
          "edit",
          value, // 修改后的节点名
          this.editingNode, // 节点数据 id === -1 为新增
          resolve.bind(this), // 接口成功回调 必须调用
          reject.bind(this) // 接口错误回调 必须调用
        );

        function resolve(res) {
          if (res.status === 0) {
            const node = this.$refs.tree.getNode(this.editingId);
            let data = node ? node.data : {};
            data.sectionId = res.result.sectionId;
            data.lessonId = res.result.lessonId;
            data.versionId = res.result.versionId;
            data.bookId = res.result.bookId;
            data.name = res.result.name;
            data.id = res.result.id;
            if (this.editingId.id === -1) {
              const parentNode = node.parent,
                preNode = node.previousSibling,
                nextNode = node.nextSibling;
              // 新增的id无法改变，需要删除，然后重新加上后台返回的，不然会有bug：新增完马上删除无法删除
              this.$refs.tree.remove(node);
              if (preNode) {
                this.$refs.tree.insertAfter(data, preNode);
              } else if (nextNode) {
                this.$refs.tree.insertBefore(data, nextNode);
              } else if (parentNode) {
                this.$refs.tree.append(data, parentNode);
              } else {
                this.$refs.tree.append(data);
              }
            }
            // this.$refs.tree.updateKeyChildren(this.editingId, data);
          } else {
            this.$refs.tree.remove(this.editingId);
          }
          this.clearEditStatus();
          this.nodeDraggable = true;
        }

        function reject() {
          if (this.editingId === -1) {
            this.$refs.tree.remove(this.editingId);
            this.clearEditStatus();
          }
          this.nodeDraggable = true;
        }
      }
    },
    /**
     * @desc 点击删除
     * @param {object} data 节点数据
     * @param {object} node 节点
     */
    clickDelete(data, node) {
      setTimeout(() => {
        if (this.confirmDialog) return;
        this.confirmDialog = true;
        this.$msgbox
          .confirm(
            this.editingNode ? "节点名称不能为空!是否删除?" : "确认删除该节点?",
            "提示",
            {
              type: "warning"
            }
          )
          .then(_ => {
            this.confirmDialog = false;
            if (this.editingId !== -1) {
              this.$emit(
                "del",
                data, // 节点数据
                resolve.bind(this), // 删除成功回调 必须调用
                reject.bind(this) // 删除失败回调 必须调用
              );
            } else {
              this.$refs.tree.remove(this.editingNode);
              this.clearEditStatus();
            }
          })
          .catch(_ => {
            this.confirmDialog = false;
            this.$refs.input && this.$refs.input.focus();
          });
      }, 100);

      function resolve(res) {
        if (res.status === 0) {
          this.$message.success("删除成功!");
          this.$refs.tree.remove(data.id);
          this.clearEditStatus();
        } else {
          reject.apply(this);
        }
      }

      function reject() {
        document.activeElement.blur();
        this.setCurrentKey(null);
        this.clearEditStatus();
      }
    },
    /**
     * @desc 清除编辑状态
     */
    clearEditStatus() {
      this.editingName = "";
      this.editingId = "";
      this.editingNode = null;
    }

    /********************* 编辑END **********************/
  }
};
</script>
<style lang="scss" src="./_tree.scss" scoped></style>
