pipeline {
  agent none

  stages {
    stage('build') {
      agent {
        kubernetes {
          yaml '''
            spec:
              containers:
              - name: jnlp
                image: 'harbor.k8s.lan/smol/jenkins-inbound-agent'
                args: ['\$(JENKINS_SECRET)', '\$(JENKINS_NAME)']
              - name: kaniko
                image: 'gcr.io/kaniko-project/executor:v1.23.2-debug'
                command:
                - /busybox/sleep
                args:
                - infinity
                volumeMounts:
                - name: jenkins-docker-cfg
                  mountPath: /kaniko/.docker/
              volumes:
              - name: jenkins-docker-cfg
                projected:
                  sources:
                  - secret:
                      name: regcred
                      items:
                        - key: .dockerconfigjson
                          path: config.json
          '''
        }
      }

      steps {
        container('kaniko') {
          sh """
            /kaniko/executor \
              -f `pwd`/Dockerfile \
              -c `pwd` \
              --cache=true \
              --destination=harbor.k8s.lan/sprawunki/szuflada:\${GIT_COMMIT:0:7} \
              --skip-tls-verify
          """
        } // container 'kaniko'
      } // steps
    } // stage 'build'

    stage('kube-score') {
      agent {
        kubernetes {
          yaml '''
            spec:
              containers:
              - name: jnlp
                image: 'harbor.k8s.lan/smol/jenkins-inbound-agent'
                args: ['\$(JENKINS_SECRET)', '\$(JENKINS_NAME)']
              - name: kube-score
                image: zegl/kube-score:v1.18.0
                command:
                - sleep
                args:
                - 99d
          '''
        }
      }

      steps {
        container('kube-score') {
            sh '''
              mkdir -p test-results
              for FILE in $(find . -name "kustomization.yaml");
              do
                kustomize build $(dirname $FILE) \
                | kube-score score -vvv --kubernetes-version v1.21 -o sarif - \
                > "test-results/$(echo $FILE | awk -F'/' '{ print $(NF-1) }').json" \
                || true
              done
            '''
        }
      }

      post {
        always {
          discoverGitReferenceBuild()

          recordIssues \
            aggregatingResults: true,
            enabledForFailure: false,
            qualityGates: [
              [integerThreshold: 1, threshold: 1.0, type: 'TOTAL']
            ],
            sourceCodeRetention: 'LAST_BUILD',
            tools: [
              sarif(pattern: 'test-results/**/*.json')
           ]
        }
      }
    }
  }

  post {
    success {
      gerritReview \
        labels: [
          'Code-Review': 0,
          'Verified': 1
        ],
	message: "${env.BUILD_URL}"
    }

    unstable {
      gerritReview \
        labels: [
          'Code-Review': -1,
          'Verified': 0
        ],
	message: "${env.BUILD_URL}"
    }

    failure {
      gerritReview \
        labels: [
          'Code-Review': -1,
          'Verified': -1
        ],
	message: "${env.BUILD_URL}"
    }
  }
}
