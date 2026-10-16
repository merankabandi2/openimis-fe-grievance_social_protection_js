/**
 * Cascader options for the grievanceCategoriesJson hierarchy.
 * With creatableOnly, a category the server reports with can_create false is dropped,
 * or kept with selectable false when one of its descendants is creatable.
 * creatableAlso lists full category names that stay selectable whatever can_create says:
 * the categories the caller creates through another mutation.
 */
export const buildCategoryOptions = (
  categories,
  { creatableOnly = false, creatableAlso = [], translateName = (name) => name } = {},
) => (
  (categories ?? []).reduce((options, cat) => {
    const children = cat.children?.length
      ? buildCategoryOptions(cat.children, { creatableOnly, creatableAlso, translateName })
      : [];
    const selectable = !creatableOnly || cat.can_create !== false || (creatableAlso ?? []).includes(cat.full_name);
    if (selectable || children.length) {
      options.push({
        label: translateName(cat.name),
        value: cat.full_name,
        selectable,
        children: children.length ? children : undefined,
      });
    }
    return options;
  }, [])
);

export const isSelectableOption = (option) => !option || option.selectable !== false;
