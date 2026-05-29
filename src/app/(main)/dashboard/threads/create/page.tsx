import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateUpdateThreadForm } from "@/features/threads/components/create-update-thread-form";

const CreateThreadPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Thread</CardTitle>
        <CardDescription>
          Start a new thread by filling out the details below. You can always
          update any of this information later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateUpdateThreadForm />
      </CardContent>
    </Card>
  );
};

export default CreateThreadPage;
