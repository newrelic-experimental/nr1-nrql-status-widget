export const deriveValues = (nrqlData, config) => {
  const values = { timeseries: [] };
  (nrqlData || []).forEach((d) => {
    const groupDisplayName =
      d.metadata.groups[d.metadata.groups.length - 1].displayName;
    const groupName = d.metadata.groups[d.metadata.groups.length - 1].name;
    const groupValue = d.metadata.groups[d.metadata.groups.length - 1].value;

    let selectedGroup = "";

    if (
      d.data[0][groupDisplayName] !== null &&
      d.data[0][groupDisplayName] !== undefined
    ) {
      values[groupDisplayName] = d.data[d.data.length - 1][groupDisplayName];
      values.latestValue = values[groupDisplayName];
      values.value = values.latestValue;
      selectedGroup = "groupDisplayName";
    } else if (
      d.data[0][groupName] !== null &&
      d.data[0][groupName] !== undefined
    ) {
      values[groupName] = d.data[d.data.length - 1][groupName];
      values.latestValue = values[groupName];
      values.value = values.latestValue;
      selectedGroup = "groupName";
    } else if (
      d.data[0][groupValue] !== null &&
      d.data[0][groupValue] !== undefined
    ) {
      values[groupName] = d.data[d.data.length - 1][groupValue];
      values.latestValue = values[groupValue];
      values.value = vaues.latestValue;
      selectedGroup = "groupValue";
    }

    assessValue(values, config);

    // perform decorations and calculations on existing values
    d.data.forEach((value) => {
      let currentValue = { ...value, value: null };
      if (selectedGroup === "groupName") {
        currentValue.value = value[groupName];
      } else if (selectedGroup === "groupDisplayName") {
        currentValue.value = value[groupDisplayName];
      } else if (selectedGroup === "groupDisplayName") {
        currentValue.value = value[groupValue];
      }
      assessValue(currentValue, config);
      values.timeseries.push(currentValue);
    });
  });

  return values;
};

export const assessValue = (value, config) => {
  value.status = "healthy";
  value.statusLabel = config.healthyLabel;

  if (config.thresholdType === "numeric") {
    if (config.thresholdDirection === "above") {
      if (value.value > config.warningThreshold) {
        value.status = "warning";
        value.statusLabel = config.warningLabel;
      }
      if (value.value > config.criticalThreshold) {
        value.status = "critical";
        value.statusLabel = config.criticalLabel;
      }
    }

    if (config.thresholdDirection === "below") {
      if (value.value < config.warningThreshold) {
        value.status = "warning";
        value.statusLabel = config.warningLabel;
      }
      if (value.value < config.criticalThreshold) {
        value.status = "critical";
        value.statusLabel = config.criticalLabel;
      }
    }
  } else if (config.thresholdType === "regex") {
    const warningRegex = new RegExp(config.warningThreshold);
    if (warningRegex.test(value.y)) {
      value.status = "warning";
      value.statusLabel = config.warningLabel;
    }

    const criticalRegex = new RegExp(config.criticalThreshold);
    if (criticalRegex.test(value.y)) {
      value.status = "critical";
      value.statusLabel = config.criticalLabel;
    }
  }
};
