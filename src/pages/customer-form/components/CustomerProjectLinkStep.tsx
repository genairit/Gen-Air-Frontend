import { Box } from "@mui/material";
import { type FC, useState } from "react";
import Card from "../../../components/Card/Card";
import { usePageStyles } from "../../page.style";
import Button from "../../../components/Button/Button";
import CheckBox from "../../../components/CheckBox/CheckBox";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ICON_NAMES } from "../../../constants/icon.constant";
import TextField from "../../../components/TextField/TextField";
import { customerService } from "../../../services/customer.service";
import InlineError from "../../../components/InlineError/InlineError";
import { SEARCH_DEBOUNCE_MS } from "../../../constants/search.constant";
import { useDebouncedValue } from "../../../hooks/debounced-value.hook";
import GenericPopup from "../../../components/GenericPopup/GenericPopup";
import LoadingState from "../../../components/LoadingState/LoadingState";
import { getApiErrorMessage } from "../../../utilities/api-error.utility";
import { linkCustomerProjectsAction } from "../../../actions/customer.action";
import { BUTTON_VARIANTS } from "../../../components/Button/constants/button.constants";
import { FIELD_TYPES } from "../../../components/TextField/constants/textfield.constants";
import type { ILinkableProject } from "../../../interfaces/customer-project-link.interface";

interface ICustomerProjectLinkStepProps {
  customerId: string;
  onFinish: () => void;
}

const CustomerProjectLinkStep: FC<ICustomerProjectLinkStepProps> = ({ customerId, onFinish }) => {
  const styles = usePageStyles();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ILinkableProject[]>([]);
  const [reassignment, setReassignment] = useState<ILinkableProject | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const projectsQuery = useQuery({
    queryKey: ["customer-linkable-projects", customerId, debouncedSearch],
    queryFn: () => customerService.getLinkableProjects(customerId, debouncedSearch),
  });
  const linkMutation = useMutation({
    mutationFn: () =>
      linkCustomerProjectsAction(
        customerId,
        selected.map(project => ({
          projectId: project.id,
          expectedCustomerId: project.customerId,
        })),
      ),
    onSuccess: onFinish,
  });
  const projects = projectsQuery.data ?? [];
  const reassignmentDescription = reassignment
    ? `${reassignment.name} משויך כעת ל־${reassignment.customer?.name}. לשייך אותו ללקוח החדש?`
    : null;
  const add = (project: ILinkableProject) => setSelected(current => [...current, project]);
  const remove = (projectId: string) =>
    setSelected(current => current.filter(project => project.id !== projectId));
  const select = (project: ILinkableProject, checked: boolean) => {
    if (!checked) {
      remove(project.id);
      return;
    }

    if (project.customerId && project.customerId !== customerId) {
      setReassignment(project);
      return;
    }

    add(project);
  };
  const save = () => {
    if (selected.length === 0) {
      onFinish();
      return;
    }

    linkMutation.mutate();
  };

  return (
    <Card gap="18px" padding="24px">
      <Box component="h2">שיוך פרויקטים ללקוח</Box>
      <Box>הלקוח נוצר. אפשר לשייך פרויקטים ודירות קיימים, או לדלג כעת.</Box>
      <TextField
        value={search}
        onChange={setSearch}
        type={FIELD_TYPES.SEARCH}
        title="חיפוש פרויקט או דירה"
        startIcon={ICON_NAMES.SEARCH}
        placeholder="שם פרויקט, קוד או מספר דירה"
      />
      {projectsQuery.isPending && <LoadingState label="טוען פרויקטים" />}
      {projectsQuery.isError && (
        <Box sx={styles.stack({ gap: "12px" })}>
          <InlineError message={getApiErrorMessage(projectsQuery.error)} />
          <Button
            text="נסה שוב"
            variant={BUTTON_VARIANTS.NEUTRAL}
            onClick={async () => {
              await projectsQuery.refetch();
            }}
          />
        </Box>
      )}
      {projectsQuery.isSuccess && projects.length === 0 && (
        <Box role="status">לא נמצאו פרויקטים</Box>
      )}
      <Box sx={styles.stack({ gap: "12px" })}>
        {projects.map(project => (
          <Box key={project.id} sx={styles.spacedRow}>
            <CheckBox
              ariaLabel={`שיוך ${project.name}`}
              onChange={checked => select(project, checked)}
              value={selected.some(item => item.id === project.id)}
              text={`${project.name} · ${project.code}${project.parentProjectId ? " · דירה" : ""}`}
            />
            {project.customer && (
              <Box component="span" sx={styles.caption}>
                משויך ל־{project.customer.name}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {selected.length > 0 && (
        <Box role="status" sx={styles.spacedRow}>
          {selected.length} נבחרו
          <Button
            text="נקה בחירה"
            onClick={() => setSelected([])}
            variant={BUTTON_VARIANTS.NEUTRAL}
          />
        </Box>
      )}
      {linkMutation.isError && <InlineError message={getApiErrorMessage(linkMutation.error)} />}
      <Box sx={styles.endRow}>
        <Button text="דלג" onClick={onFinish} variant={BUTTON_VARIANTS.NEUTRAL} />
        <Button onClick={save} text="שמור שיוכים" isLoading={linkMutation.isPending} />
      </Box>
      <GenericPopup
        open={reassignment !== null}
        title="אישור שינוי שיוך פרויקט"
        content={reassignmentDescription}
        onClose={() => setReassignment(null)}
        buttons={{
          primary: {
            text: "אשר שיוך מחדש",
            onClick: () => {
              if (reassignment) {
                add(reassignment);
              }
            },
          },
          secondary: { text: "ביטול", onClick: () => setReassignment(null) },
        }}
      />
    </Card>
  );
};

export default CustomerProjectLinkStep;
