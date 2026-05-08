// Eight-handle bounding-box overlay over the canvas wrapper. Pure DOM —
// nothing it draws ends up in the downloaded PNG. Coordinates come in as
// canvas-space rect (x/y/w/h in the format's pixel grid); displayScale
// converts them to the wrapper's display pixels.
const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize' },
  { id: 'n',  cursor: 'ns-resize'   },
  { id: 'ne', cursor: 'nesw-resize' },
  { id: 'e',  cursor: 'ew-resize'   },
  { id: 'se', cursor: 'nwse-resize' },
  { id: 's',  cursor: 'ns-resize'   },
  { id: 'sw', cursor: 'nesw-resize' },
  { id: 'w',  cursor: 'ew-resize'   },
]

function handlePos(id, x, y, w, h) {
  switch (id) {
    case 'nw': return { cx: x,         cy: y         }
    case 'n':  return { cx: x + w / 2, cy: y         }
    case 'ne': return { cx: x + w,     cy: y         }
    case 'e':  return { cx: x + w,     cy: y + h / 2 }
    case 'se': return { cx: x + w,     cy: y + h     }
    case 's':  return { cx: x + w / 2, cy: y + h     }
    case 'sw': return { cx: x,         cy: y + h     }
    case 'w':  return { cx: x,         cy: y + h / 2 }
  }
}

export default function TransformHandles({ rect, displayScale, onHandleDown }) {
  if (!rect) return null
  const x = rect.x * displayScale
  const y = rect.y * displayScale
  const w = rect.w * displayScale
  const h = rect.h * displayScale
  const HS = 12

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div
        className="absolute border-2 border-amber-500"
        style={{ left: x, top: y, width: w, height: h }}
      />
      {HANDLES.map(({ id, cursor }) => {
        const { cx, cy } = handlePos(id, x, y, w, h)
        return (
          <div
            key={id}
            data-handle={id}
            onMouseDown={e => onHandleDown(id, e)}
            className="absolute bg-white border-2 border-amber-500 rounded-sm pointer-events-auto"
            style={{
              left: cx - HS / 2,
              top: cy - HS / 2,
              width: HS,
              height: HS,
              cursor,
            }}
          />
        )
      })}
    </div>
  )
}
