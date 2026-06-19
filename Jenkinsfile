pipeline {
agent any


stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Stop Existing Containers') {
        steps {
            sh 'docker-compose down || true'
        }
    }

    stage('Build Application') {
        steps {
            sh 'docker-compose build'
        }
    }

    stage('Deploy Application') {
        steps {
            sh 'docker-compose up -d'
        }
    }

    stage('Verify Running Containers') {
        steps {
            sh 'docker ps'
        }
    }
}

post {
    success {
        echo 'Frontend and Backend deployed successfully!'
    }

    failure {
        echo 'Deployment failed!'
    }
}

}
