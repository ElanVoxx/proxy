let config = (ProxyUtils.JSON5 || JSON).parse($content ?? $files[0])

const proxies = await produceArtifact({
  type: 'subscription',
  name: 'subtore订阅名称',
  platform: 'sing-box',
  produceType: 'internal'
})

const proxyTags = proxies.map(p => p.tag)

// ==========================
// 1. 删除旧订阅节点（防重复）
// ==========================
config.outbounds = (config.outbounds || []).filter(o =>
  !proxies.some(p => p.tag === o.tag)
)

// ==========================
// 2. 插入订阅节点（放 DIRECT 后）
// ==========================
const directIndex = config.outbounds.findIndex(o => o.tag === 'DIRECT')
const insertIndex = directIndex === -1 ? 0 : directIndex + 1

config.outbounds.splice(insertIndex, 0, ...proxies)

// ==========================
// 3. 🔥 核心：自动填充所有 selector
// ==========================
for (const o of config.outbounds) {
  if (o.type === 'selector') {
    o.outbounds = [...proxyTags]
  }
}

// ==========================
// 4. 输出
// ==========================
$content = JSON.stringify(config, null, 2)
