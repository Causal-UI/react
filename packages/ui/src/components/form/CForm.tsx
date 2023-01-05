import type { ReactNode, Ref } from 'react'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import clsx from 'clsx'
import type { CSize } from '@casual-ui/types'
import useSize, { CSizeContext } from '../../hooks/useSize'
import useGutterSize, { CGutterSizeContext } from '../../hooks/useGutterSize'
import type {
  Errors,
  Validator,
  Validators,
} from './CFormContext'
import {
  CFormContext,
  useFormContext,
} from './CFormContext'
import type { CFormItemProps } from './CFormItem'
import CFormItem from './CFormItem'

interface CFormProps {
  /**
   * The size of all components in this form.
   * @zh 尺寸
   */
  size?: CSize
  /**
   * The gutter size of all elements in this form.
   * @zh 项间隔尺寸
   */
  gutterSize?: CSize
  /**
   * Each item's col span. Total is 12.
   * @zh 每个表单项所占列数，总列宽为12
   */
  col?: number
  /**
   * The label and form component align direction. It is based on <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction">flex-direction</a>
   * @zh 文字与表单排列方向，基于<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction">flex-direction</a>实现
   */
  labelDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  /**
   * The label width
   * @zh 文本提示宽度
   */
  labelWidth?: string
  /**
   * The label align method. It is based on <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/text-align">text-align</a>
   * @zh 文字对齐方向，表现为<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/text-align">text-align</a>的值
   */
  labelAlign?: 'left' | 'right' | 'center'
  /**
   * The whole form data.
   * @zh 表单整体值
   */
  value: any
  /**
   * The items config.
   * @zh 表单项配置数组
   */
  items: CFormItemProps[]
  /**
   * The content of form. It is recommend to use CFormItem.
   * @zh 表单内容，推荐使用 CFormItem
   */
  children?: ReactNode
}
const FormWithoutForward = (
  {
    size,
    col = 6,
    labelWidth = '100px',
    labelAlign,
    labelDirection,
    children,
    value,
    gutterSize,
    items = [],
  }: CFormProps,
  ref: Ref<{
    validateAll: () => void | Promise<void>
    clearAll: () => void
  }>,
) => {
  const validators: Validators = {}

  const addValidator = (field: string, newValidator: Validator[]) => {
    validators[field] = newValidator
  }

  const [errors, setErrors] = useState<Errors>()

  const clearAll = () => {
    setErrors({})
  }

  const realGutterSize = useGutterSize(gutterSize)

  const clearField = (field: string) => {
    setErrors({
      ...errors,
      [field]: false,
    })
  }

  const validateField = async (field: string) => {
    const fieldRules = validators[field]
    let hasError: string | false = false
    if (fieldRules) {
      for (const rule of fieldRules) {
        const error = await rule(value[field])
        if (error) {
          hasError = error
          break
        }
      }
    }
    setErrors({
      ...errors,
      [field]: hasError,
    })
  }

  const validateAll = async () => {
    const errors: Errors = {}
    for (const field in validators) {
      const rules = validators[field]
      for (const rule of rules) {
        const error = await rule(value[field])
        if (error) {
          errors[field] = error
          break
        }
      }
    }
    setErrors(errors)
  }

  const formContextValue = useFormContext({
    col,
    labelAlign,
    labelWidth,
    labelDirection,
    validateAll,
    addValidator,
    clearField,
    validateField,
    clearAll,
    errors,
  })

  useImperativeHandle(ref, () => ({
    validateAll,
    clearAll,
  }))

  return (
    <CFormContext.Provider value={formContextValue}>
      <CGutterSizeContext.Provider value={realGutterSize}>
        <CSizeContext.Provider value={useSize(size)}>
          <div
            className={clsx(
              'c-form',
              'c-row',
              'c-item-center',
              'c-wrap',
              `c-gutter-${realGutterSize}`,
            )}
          >
            {items.map((item, i) => (
              <CFormItem
                key={item.field ? item.field : i}
                {...item}
              />
            ))}
            {children}
          </div>
        </CSizeContext.Provider>
      </CGutterSizeContext.Provider>
    </CFormContext.Provider>
  )
}
const CForm = forwardRef(FormWithoutForward)
export default CForm
export type { CFormProps }
