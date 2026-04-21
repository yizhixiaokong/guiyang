export function SchedulePanel() {
  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 03</p>
          <h2>详细时间计划表</h2>
          <p>
            这个模块会在你拿到其他 AI 的详细时间计划表后，再按那份内容做定制化展示。当前只保留视觉承载位，不预先限制数据结构。
          </p>
        </div>
      </header>

      <div className="timeline-placeholder" aria-label="详细时间计划表占位">
        <div className="timeline-content">
          <header>
            <div>
              <p className="mini-label">Awaiting Schedule Input</p>
              <h3>等待具体时间表数据</h3>
            </div>
            <span className="status-pill">empty</span>
          </header>

          <p>
            当你把外部 AI 输出的时间计划表发给我后，我会根据实际字段和节奏，把这里改成一版更贴近执行感的时间轴、表格或卡片式排版。
          </p>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span className="timeline-time">09:00</span>
              <strong>这里会放具体安排</strong>
              <span>例如出发、早餐、抵达景点、换乘、用餐、夜游等。</span>
            </li>
            <li className="timeline-item">
              <span className="timeline-time">13:30</span>
              <strong>这里会放停留时长和缓冲时间</strong>
              <span>等真实数据到位后再决定是否做成小时轴或执行表。</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}