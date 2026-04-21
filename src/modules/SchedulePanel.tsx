export function SchedulePanel() {
  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 03</p>
          <h2>详细时间计划表</h2>
          <p>
            把一天里的出发、用餐、景点停留和夜游安排整理成连续可读的时间线。
          </p>
        </div>
      </header>

      <div className="timeline-placeholder" aria-label="详细时间计划表占位">
        <div className="timeline-content">
          <header>
            <div>
              <p className="mini-label">Daily Schedule</p>
              <h3>一日时间安排预览</h3>
            </div>
            <span className="status-pill">empty</span>
          </header>

          <p>
            这里会把一天的出发、游玩、换乘、用餐和夜间活动按时间顺序排开。
          </p>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span className="timeline-time">09:00</span>
              <strong>早间出发与早餐</strong>
              <span>适合放集合时间、早餐地点和第一段通勤信息。</span>
            </li>
            <li className="timeline-item">
              <span className="timeline-time">13:30</span>
              <strong>午后游玩与停留节奏</strong>
              <span>用来展示景点停留时长、缓冲时间和晚间安排衔接。</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}